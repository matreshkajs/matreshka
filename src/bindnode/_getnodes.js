import selectNodes from './_selectnodes';
import dom from '../_dom'

const htmlReg = /</;
const customSelectorReg = /:sandbox|:bound\(([^(]*)\)/;

// TODO write description
export default function getNodes(object, selector) {
    let nodes;

    if (typeof selector == 'string' && !htmlReg.test(selector) && customSelectorReg.test(selector)) {
        nodes = selectNodes(object, selector);
    } else {
        nodes = dom.$(selector);
    }

    return nodes;
}