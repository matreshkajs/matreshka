import initMK from '../_core/init';
import checkObjectType from '../_helpers/checkobjecttype';
import matreshkaError from '../_helpers/matreshkaerror';
import addListener from '../on/_addlistener';
import delegateListener from '../on/_delegatelistener';
import debounce from '../_helpers/debounce';
import addSource from './_addsource';
import createCalcHandler from './_createcalchandler';
import defineProp from '../_core/defineprop';

export default function calc(object, target, sources, givenHandler, eventOptions) {
    if(typeof this === 'object' && this.isMK) {
        // when context is Matreshka instance, use this as an object and shift other args
        eventOptions = givenHandler;
        givenHandler = sources;
        sources = target;
        target = object;
        object = this;
    } else {
        // throw error when object type is wrong
        checkObjectType(object, 'calc');
    }

    if (target instanceof Array) {
        /*
         * accept array of objects
         * this.calc([{target, source, handler, event}], commonEventOptions);
         */
        nofn.forEach(target, ({
            target: itemTarget,
            source: itemSource,
            handler: itemHandler,
            event: itemEventOptions
        }) => {
            const commonEventOptions = sources;
            const mergedEventOptions = {};

            if(commonEventOptions) {
                // extend event object by "global" event
                nofn.assign(mergedEventOptions, commonEventOptions);
            }

            if(itemEventOptions) {
                // extend event object by "local" event ("event" key of an object)
                nofn.assign(mergedEventOptions, itemEventOptions);
            }

            calc(object, itemTarget, itemSource, itemHandler, mergedEventOptions);
        });

        return object;
    }

    if(typeof target !== 'string') {
        throw matreshkaError('calc:target_type', { target });
    }

    eventOptions = eventOptions || {};
    const def = initMK(object);
    const {
        setOnInit=true,
        deep=true,
        debounce: debounceOption=false,
        // the next option is used to hide a property for internal use (eg in bindings parser)
        isTargetPropertyHidden=false
    } = eventOptions;
    const defaultHandler = value => value;
    const handler = givenHandler || defaultHandler;
    const allSources = [];
	let calcHandler = createCalcHandler({
		object,
		eventOptions,
		allSources,
		target,
		def,
		handler
	});

    // create property definition
    defineProp(object, target, isTargetPropertyHidden);

    if(!(sources instanceof Array)) {
        sources = [sources];
    }

    // by default debouncing is off
    // it can be turned on by passing debounce=true or debounce=<number> to event object
    if (debounceOption || debounceOption === 0) {
        const delay = typeof debounceOption === 'number' ? debounceOption : 0;
        calcHandler = debounce(calcHandler, delay);
    }

    nofn.forEach(sources, source => {
        if(typeof source === 'string') {
            addSource({
				calcHandler,
				allSources,
                sourceKey: source,
                sourceObject: object
            });
        } else {
            if(!source || typeof source !== 'object') {
                throw matreshkaError('calc:source_type', { source });
            }

            const sourceKey = source.key;
            const sourceObject = source.object;
            if(sourceKey instanceof Array) {
                nofn.forEach(sourceKey, (sourceKeyItem) => {
                    addSource({
						calcHandler,
						allSources,
                        sourceKey: sourceKeyItem,
                        sourceObject
                    });
                })
            } else {
                addSource({
					calcHandler,
					allSources,
                    sourceKey,
                    sourceObject
                });
            }
        }
    });

    if(setOnInit) {
        calcHandler()
    }
}