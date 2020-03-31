'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.waitForReact = exports.ReactSelector = undefined;

var _testcafe = require('testcafe');

const ReactSelector = exports.ReactSelector = (0, _testcafe.Selector)(selector => {
    const getRootElsReact15 = /*global document*/

    /*eslint-disable no-unused-vars*/
    function getRootElsReact15() {
        /*eslint-enable no-unused-vars*/

        const ELEMENT_NODE = 1;

        function getRootComponent(el) {
            if (!el || el.nodeType !== ELEMENT_NODE) return null;

            for (let _i = 0, _Object$keys = Object.keys(el), _length = _Object$keys.length; _i < _length; _i++) {
                var prop = _Object$keys[_i];
                if (!/^__reactInternalInstance/.test(prop)) continue;

                return el[prop]._hostContainerInfo._topLevelWrapper._renderedComponent;
            }

            return null;
        }

        const rootEls = [].slice.call(document.querySelectorAll('[data-reactroot]'));
        const checkRootEls = rootEls.length && Object.keys(rootEls[0]).some(prop => {
            const rootEl = rootEls[0];

            //NOTE: server rendering in React 16 also adds data-reactroot attribute, we check existing the
            //alternate field because it doesn't exists in React 15.
            return (/^__reactInternalInstance/.test(prop) && !rootEl[prop].hasOwnProperty('alternate')
            );
        });

        return (checkRootEls && rootEls || []).map(getRootComponent);
    };

    const getRootElsReact16 = /*global document*/

    /*eslint-disable no-unused-vars*/
    function getRootElsReact16(el) {
        el = el || document.body;

        let rootEls = [];

        if (el._reactRootContainer) {
            const rootContainer = el._reactRootContainer._internalRoot || el._reactRootContainer;

            rootEls.push(rootContainer.current.child);
        }

        const children = el.children;

        if (children) {
            for (let index = 0; index < children.length; ++index) {
                const child = children[index];

                rootEls = rootEls.concat(getRootElsReact16(child));
            }
        }

        return rootEls;
    };

    const selectorReact15 = /*global window rootEls defineSelectorProperty visitedRootEls checkRootNodeVisited*/

    /*eslint-disable no-unused-vars*/
    function react15elector(selector, parents = rootEls) {
        const ELEMENT_NODE = 1;
        const COMMENT_NODE = 8;

        window['%testCafeReactFoundComponents%'] = [];

        /*eslint-enable no-unused-vars*/
        function getName(component) {
            const currentElement = component._currentElement;

            let name = component.getName ? component.getName() : component._tag;

            //NOTE: getName() returns null in IE, also it try to get function name for a stateless component
            if (name === null && currentElement && typeof currentElement === 'object') {
                const matches = currentElement.type.toString().match(/^function\s*([^\s(]+)/);

                if (matches) name = matches[1];
            }

            return name;
        }

        function getRootComponent(el) {
            if (!el || el.nodeType !== ELEMENT_NODE) return null;

            for (let _i2 = 0, _Object$keys2 = Object.keys(el), _length2 = _Object$keys2.length; _i2 < _length2; _i2++) {
                var prop = _Object$keys2[_i2];
                if (!/^__reactInternalInstance/.test(prop)) continue;

                return el[prop]._hostContainerInfo._topLevelWrapper._renderedComponent;
            }

            return null;
        }

        if (!window['%testCafeReactSelectorUtils%']) window['%testCafeReactSelectorUtils%'] = { getName, getRootComponent };

        function getRenderedChildren(component) {
            const hostNode = component.getHostNode();
            const hostNodeType = hostNode.nodeType;
            const container = component._instance && component._instance.container;
            const isRootComponent = hostNode.hasAttribute && hostNode.hasAttribute('data-reactroot');

            //NOTE: prevent the repeating visiting of reactRoot Component inside of portal
            if (component._renderedComponent && isRootComponent) {
                if (checkRootNodeVisited(component._renderedComponent)) return [];

                visitedRootEls.push(component._renderedComponent);
            }

            //NOTE: Detect if it's a portal component
            if (hostNodeType === COMMENT_NODE && container) {
                const domNode = container.querySelector('[data-reactroot]');

                return { _: getRootComponent(domNode) };
            }

            return component._renderedChildren || component._renderedComponent && { _: component._renderedComponent } || {};
        }

        function parseSelectorElements(compositeSelector) {
            return compositeSelector.split(' ').filter(el => !!el).map(el => el.trim());
        }

        function reactSelect(compositeSelector) {
            const foundComponents = [];

            function findDOMNode(rootEl) {
                if (typeof compositeSelector !== 'string') throw new Error(`Selector option is expected to be a string, but it was ${typeof compositeSelector}.`);

                var selectorIndex = 0;
                var selectorElms = parseSelectorElements(compositeSelector);

                if (selectorElms.length) defineSelectorProperty(selectorElms[selectorElms.length - 1]);

                function walk(reactComponent, cb) {
                    if (!reactComponent) return;

                    const componentWasFound = cb(reactComponent);

                    //NOTE: we're looking for only between the children of component
                    if (selectorIndex > 0 && selectorIndex < selectorElms.length && !componentWasFound) {
                        const isTag = selectorElms[selectorIndex].toLowerCase() === selectorElms[selectorIndex];
                        const parent = reactComponent._hostParent;

                        if (isTag && parent) {
                            var renderedChildren = parent._renderedChildren;
                            const renderedChildrenKeys = Object.keys(renderedChildren);

                            const currentElementId = renderedChildrenKeys.filter(key => {
                                var renderedComponent = renderedChildren[key]._renderedComponent;

                                return renderedComponent && renderedComponent._domID === reactComponent._domID;
                            })[0];

                            if (!renderedChildren[currentElementId]) return;
                        }
                    }

                    const currSelectorIndex = selectorIndex;

                    renderedChildren = getRenderedChildren(reactComponent);

                    Object.keys(renderedChildren).forEach(key => {
                        walk(renderedChildren[key], cb);

                        selectorIndex = currSelectorIndex;
                    });
                }

                return walk(rootEl, reactComponent => {
                    const componentName = getName(reactComponent);

                    if (!componentName) return false;

                    const domNode = reactComponent.getHostNode();

                    if (selectorElms[selectorIndex] !== componentName) return false;

                    if (selectorIndex === selectorElms.length - 1) {
                        if (foundComponents.indexOf(domNode) === -1) foundComponents.push(domNode);

                        window['%testCafeReactFoundComponents%'].push({ node: domNode, component: reactComponent });
                    }

                    selectorIndex++;

                    return true;
                });
            }

            [].forEach.call(parents, findDOMNode);

            return foundComponents;
        }

        return reactSelect(selector);
    };

    const selectorReact16 = /*global window document Node rootEls defineSelectorProperty visitedRootEls checkRootNodeVisited*/

    /*eslint-disable no-unused-vars*/
    function react16Selector(selector, parents = rootEls) {
        window['%testCafeReactFoundComponents%'] = [];

        /*eslint-enable no-unused-vars*/
        function createAnnotationForEmptyComponent(component) {
            const comment = document.createComment('testcafe-react-selectors: the requested component didn\'t render any DOM elements');

            comment.__$$reactInstance = component;

            if (!window['%testCafeReactEmptyComponent%']) window['%testCafeReactEmptyComponent%'] = [];

            window['%testCafeReactEmptyComponent%'].push(comment);

            return comment;
        }

        function getName(component) {
            //react memo
            // it will find the displayName on the elementType if you set it
            if (component.elementType && component.elementType.displayName) return component.elementType.displayName;

            if (!component.type && !component.memoizedState) return null;

            const currentElement = component.type ? component : component.memoizedState.element;

            //NOTE: tag
            if (typeof component.type === 'string') return component.type;
            if (component.type.displayName || component.type.name) return component.type.displayName || component.type.name;

            const matches = currentElement.type.toString().match(/^function\s*([^\s(]+)/);

            if (matches) return matches[1];

            return null;
        }

        function getContainer(component) {
            let node = component;

            while (!(node.stateNode instanceof Node)) {
                if (node.child) node = node.child;else break;
            }

            if (!(node.stateNode instanceof Node)) return null;

            return node.stateNode;
        }

        function getRenderedChildren(component) {
            const isRootComponent = rootEls.indexOf(component) > -1;

            //Nested root element
            if (isRootComponent) {
                if (checkRootNodeVisited(component)) return [];

                visitedRootEls.push(component);
            }

            //Portal component
            if (!component.child) {
                const portalRoot = component.stateNode && component.stateNode.container && component.stateNode.container._reactRootContainer;

                const rootContainer = portalRoot && (portalRoot._internalRoot || portalRoot);

                if (rootContainer) component = rootContainer.current;
            }

            if (!component.child) return [];

            let currentChild = component.child;

            if (typeof component.type !== 'string') currentChild = component.child;

            const children = [currentChild];

            while (currentChild.sibling) {
                children.push(currentChild.sibling);

                currentChild = currentChild.sibling;
            }

            return children;
        }

        function parseSelectorElements(compositeSelector) {
            return compositeSelector.split(' ').filter(el => !!el).map(el => el.trim());
        }

        function reactSelect(compositeSelector) {
            const foundComponents = [];

            function findDOMNode(rootComponent) {
                if (typeof compositeSelector !== 'string') throw new Error(`Selector option is expected to be a string, but it was ${typeof compositeSelector}.`);

                var selectorIndex = 0;
                var selectorElms = parseSelectorElements(compositeSelector);

                if (selectorElms.length) defineSelectorProperty(selectorElms[selectorElms.length - 1]);

                function walk(reactComponent, cb) {
                    if (!reactComponent) return;

                    const componentWasFound = cb(reactComponent);
                    const currSelectorIndex = selectorIndex;

                    const isNotFirstSelectorPart = selectorIndex > 0 && selectorIndex < selectorElms.length;

                    if (isNotFirstSelectorPart && !componentWasFound) {
                        const isTag = selectorElms[selectorIndex].toLowerCase() === selectorElms[selectorIndex];

                        //NOTE: we're looking for only between the children of component
                        if (isTag && getName(reactComponent.return) !== selectorElms[selectorIndex - 1]) return;
                    }

                    const renderedChildren = getRenderedChildren(reactComponent);

                    Object.keys(renderedChildren).forEach(key => {
                        walk(renderedChildren[key], cb);

                        selectorIndex = currSelectorIndex;
                    });
                }

                return walk(rootComponent, reactComponent => {
                    const componentName = getName(reactComponent);

                    if (!componentName) return false;

                    const domNode = getContainer(reactComponent);

                    if (selectorElms[selectorIndex] !== componentName) return false;

                    if (selectorIndex === selectorElms.length - 1) {
                        if (foundComponents.indexOf(domNode) === -1) foundComponents.push(domNode || createAnnotationForEmptyComponent(reactComponent));

                        window['%testCafeReactFoundComponents%'].push({ node: domNode, component: reactComponent });
                    }

                    selectorIndex++;

                    return true;
                });
            }

            [].forEach.call(parents, findDOMNode);

            return foundComponents;
        }

        return reactSelect(selector);
    };

    let visitedRootEls = [];
    let rootEls = null;

    function checkRootNodeVisited(component) {
        return visitedRootEls.indexOf(component) > -1;
    }

    function defineSelectorProperty(value) {
        if (window['%testCafeReactSelector%']) delete window['%testCafeReactSelector%'];

        Object.defineProperty(window, '%testCafeReactSelector%', {
            enumerable: false,
            configurable: true,
            writable: false,
            value: value
        });
    }

    rootEls = getRootElsReact15();

    let foundDOMNodes = void 0;

    if (rootEls.length) {
        window['%testCafeReactVersion%'] = 15;
        window['$testCafeReactSelector'] = selectorReact15;

        foundDOMNodes = selectorReact15(selector);
    }

    rootEls = getRootElsReact16();

    if (rootEls.length) {
        window['%testCafeReactVersion%'] = 16;
        window['$testCafeReactSelector'] = selectorReact16;
        window['$testCafeReact16Roots'] = rootEls;

        foundDOMNodes = selectorReact16(selector);
    }

    visitedRootEls = [];

    if (foundDOMNodes) return foundDOMNodes;

    throw new Error("React component tree is not loaded yet or the current React version is not supported. This module supports React version 15.x and newer. To wait until the React's component tree is loaded, add the `waitForReact` method to fixture's `beforeEach` hook.");
}).addCustomMethods({
    getReact: (node, fn) => {
        const reactVersion = window['%testCafeReactVersion%'];
        const react15Utils = /*global window*/
        function () {
            const ELEMENT_NODE = 1;
            const COMMENT_NODE = 8;
            const utils = window['%testCafeReactSelectorUtils%'];

            function copyReactObject(obj) {
                var copiedObj = {};

                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && prop !== 'children') copiedObj[prop] = obj[prop];
                }

                return copiedObj;
            }

            function getComponentInstance(component) {
                const parent = component._hostParent || component;
                const renderedChildren = parent._renderedChildren || { _: component._renderedComponent } || {};
                const renderedChildrenKeys = Object.keys(renderedChildren);
                const componentName = window['%testCafeReactSelector%'];

                for (let index = 0; index < renderedChildrenKeys.length; ++index) {
                    const key = renderedChildrenKeys[index];
                    let renderedComponent = renderedChildren[key];
                    let componentInstance = null;

                    while (renderedComponent) {
                        if (componentName === utils.getName(renderedComponent)) componentInstance = renderedComponent._instance || renderedComponent._currentElement;

                        if (renderedComponent._domID === component._domID) return componentInstance;

                        renderedComponent = renderedComponent._renderedComponent;
                    }
                }

                return null;
            }

            function getComponentForDOMNode(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                const isRootNode = el.hasAttribute && el.hasAttribute('data-reactroot');
                const componentName = window['%testCafeReactSelector%'];

                if (isRootNode) {
                    const rootComponent = utils.getRootComponent(el);

                    //NOTE: check if it's not a portal component
                    if (utils.getName(rootComponent) === componentName) return rootComponent._instance;

                    return getComponentInstance(rootComponent);
                }

                for (let _i3 = 0, _Object$keys3 = Object.keys(el), _length3 = _Object$keys3.length; _i3 < _length3; _i3++) {
                    var prop = _Object$keys3[_i3];
                    if (!/^__reactInternalInstance/.test(prop)) continue;

                    return getComponentInstance(el[prop]);
                }

                return null;
            }

            function getComponentKey(component) {
                const currentElement = component._reactInternalInstance ? component._reactInternalInstance._currentElement : component;

                return currentElement.key;
            }

            /*eslint-disable no-unused-vars*/
            function getReact(node, fn) {
                /*eslint-enable no-unused-vars*/
                const componentInstance = getComponentForDOMNode(node);

                if (!componentInstance) return null;

                delete window['%testCafeReactSelector%'];

                if (typeof fn === 'function') {
                    return fn({
                        state: copyReactObject(componentInstance.state),
                        props: copyReactObject(componentInstance.props),
                        key: getComponentKey(componentInstance)
                    });
                }

                return {
                    state: copyReactObject(componentInstance.state),
                    props: copyReactObject(componentInstance.props),
                    key: getComponentKey(componentInstance)
                };
            }

            function getFoundComponentInstances() {
                return window['%testCafeReactFoundComponents%'].map(desc => desc.component);
            }

            function scanDOMNodeForReactComponent(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                let component = null;

                for (let _i4 = 0, _Object$keys4 = Object.keys(el), _length4 = _Object$keys4.length; _i4 < _length4; _i4++) {
                    const prop = _Object$keys4[_i4];
                    if (!/^__reactInternalInstance/.test(prop)) continue;

                    component = el[prop];

                    break;
                }

                if (!component) return null;

                const parent = component._hostParent;

                if (!parent) return component;

                const renderedChildren = parent._renderedChildren;
                const renderedChildrenKeys = Object.keys(renderedChildren);

                const currentElementId = renderedChildrenKeys.filter(key => {
                    const renderedComponent = renderedChildren[key];

                    return renderedComponent && renderedComponent.getHostNode() === el;
                })[0];

                return renderedChildren[currentElementId];
            }

            return {
                getReact,
                getComponentForDOMNode,
                scanDOMNodeForReactComponent,
                getFoundComponentInstances,
                getComponentKey
            };
        }();

        const react16Utils = /*global window Node*/
        function () {
            const ELEMENT_NODE = 1;
            const COMMENT_NODE = 8;

            function copyReactObject(obj) {
                var copiedObj = {};

                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && prop !== 'children') copiedObj[prop] = obj[prop];
                }

                return copiedObj;
            }

            function getComponentForDOMNode(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                let component = null;
                const emptyComponentFound = window['%testCafeReactEmptyComponent%'] && window['%testCafeReactEmptyComponent%'].length;

                if (emptyComponentFound && el.nodeType === COMMENT_NODE) component = window['%testCafeReactEmptyComponent%'].shift().__$$reactInstance;else if (window['%testCafeReactFoundComponents%'].length) component = window['%testCafeReactFoundComponents%'].filter(desc => desc.node === el)[0].component;

                const props = component.stateNode && component.stateNode.props || component.memoizedProps;
                const state = component.stateNode && component.stateNode.state || component.memoizedState;
                const key = component.key;

                return { props, state, key };
            }

            /*eslint-enable no-unused-vars*/
            function getReact(node, fn) {
                /*eslint-disable no-unused-vars*/
                const componentInstance = getComponentForDOMNode(node);

                if (!componentInstance) return null;

                delete window['%testCafeReactSelector%'];
                delete window['%testCafeReactEmptyComponent%'];
                delete window['%testCafeReactFoundComponents%'];

                if (typeof fn === 'function') {
                    return fn({
                        state: copyReactObject(componentInstance.state),
                        props: copyReactObject(componentInstance.props),
                        key: componentInstance.key
                    });
                }

                return {
                    state: copyReactObject(componentInstance.state),
                    props: copyReactObject(componentInstance.props),
                    key: componentInstance.key
                };
            }

            function scanDOMNodeForReactInstance(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                if (el.nodeType === COMMENT_NODE) return el.__$$reactInstance.return.child;

                for (let _i5 = 0, _Object$keys5 = Object.keys(el), _length5 = _Object$keys5.length; _i5 < _length5; _i5++) {
                    var prop = _Object$keys5[_i5];
                    if (!/^__reactInternalInstance/.test(prop)) continue;

                    let nestedComponent = el[prop];

                    if (typeof nestedComponent.type !== 'string') return nestedComponent;

                    let parentComponent = nestedComponent;

                    do {
                        nestedComponent = parentComponent;
                        parentComponent = nestedComponent.return;
                    } while (parentComponent && parentComponent.type && !(parentComponent.stateNode instanceof Node));

                    return nestedComponent;
                }

                return null;
            }

            function getRenderedComponentVersion(component, rootInstances) {
                if (!component.alternate) return component;

                let component1 = component;
                let component2 = component.alternate;

                while (component1.return) component1 = component1.return;
                while (component2.return) component2 = component2.return;

                if (rootInstances.indexOf(component1) > -1) return component;

                return component.alternate;
            }

            function scanDOMNodeForReactComponent(domNode) {
                const rootInstances = window['$testCafeReact16Roots'].map(rootEl => rootEl.return || rootEl);
                const reactInstance = scanDOMNodeForReactInstance(domNode);

                return getRenderedComponentVersion(reactInstance, rootInstances);
            }

            function getFoundComponentInstances() {
                return window['%testCafeReactFoundComponents%'].map(desc => desc.component);
            }

            function getComponentKey(instance) {
                return instance.key;
            }

            return { getReact, getComponentForDOMNode, scanDOMNodeForReactComponent, getFoundComponentInstances, getComponentKey };
        }();

        delete window['%testCafeReactVersion%'];

        if (reactVersion === 15) return react15Utils.getReact(node, fn);
        if (reactVersion === 16) return react16Utils.getReact(node, fn);
    }
}).addCustomMethods({
    withProps: (nodes, ...args) => {
        window['%testCafeReactFoundComponents%'] = window['%testCafeReactFoundComponents%'].filter(component => {
            return nodes.indexOf(component.node) > -1;
        });

        function isObject(value) {
            return typeof value === 'object' && value !== null && !Array.isArray(value);
        }

        function isEql(value1, value2) {
            if (typeof value1 !== 'object' || value1 === null || typeof value2 !== 'object' || value2 === null) return value1 === value2;

            if (Object.keys(value1).length !== Object.keys(value2).length) return false;

            for (const prop in value1) {
                if (!value2.hasOwnProperty(prop)) return false;
                if (!isEql(value1[prop], value2[prop])) return false;
            }

            return true;
        }

        function isInclude(value1, value2) {
            if (typeof value1 !== 'object' || value1 === null || typeof value2 !== 'object' || value2 === null) return value1 === value2;

            for (const prop in value2) {
                if (!value1.hasOwnProperty(prop)) return false;
                if (!isInclude(value1[prop], value2[prop])) return false;
            }

            return true;
        }

        function matchProps(value1, value2, exactObjectMatch) {
            if (exactObjectMatch) return isEql(value1, value2);

            return isInclude(value1, value2);
        }

        function componentHasProps({ props }, filterProps, exactObjectMatch) {
            for (let _i6 = 0, _Object$keys6 = Object.keys(filterProps), _length6 = _Object$keys6.length; _i6 < _length6; _i6++) {
                const prop = _Object$keys6[_i6];
                if (!props.hasOwnProperty(prop)) return false;

                if (!matchProps(props[prop], filterProps[prop], exactObjectMatch)) return false;
            }

            return true;
        }

        const reactVersion = window['%testCafeReactVersion%'];
        const react15Utils = /*global window*/
        function () {
            const ELEMENT_NODE = 1;
            const COMMENT_NODE = 8;
            const utils = window['%testCafeReactSelectorUtils%'];

            function copyReactObject(obj) {
                var copiedObj = {};

                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && prop !== 'children') copiedObj[prop] = obj[prop];
                }

                return copiedObj;
            }

            function getComponentInstance(component) {
                const parent = component._hostParent || component;
                const renderedChildren = parent._renderedChildren || { _: component._renderedComponent } || {};
                const renderedChildrenKeys = Object.keys(renderedChildren);
                const componentName = window['%testCafeReactSelector%'];

                for (let index = 0; index < renderedChildrenKeys.length; ++index) {
                    const key = renderedChildrenKeys[index];
                    let renderedComponent = renderedChildren[key];
                    let componentInstance = null;

                    while (renderedComponent) {
                        if (componentName === utils.getName(renderedComponent)) componentInstance = renderedComponent._instance || renderedComponent._currentElement;

                        if (renderedComponent._domID === component._domID) return componentInstance;

                        renderedComponent = renderedComponent._renderedComponent;
                    }
                }

                return null;
            }

            function getComponentForDOMNode(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                const isRootNode = el.hasAttribute && el.hasAttribute('data-reactroot');
                const componentName = window['%testCafeReactSelector%'];

                if (isRootNode) {
                    const rootComponent = utils.getRootComponent(el);

                    //NOTE: check if it's not a portal component
                    if (utils.getName(rootComponent) === componentName) return rootComponent._instance;

                    return getComponentInstance(rootComponent);
                }

                for (let _i7 = 0, _Object$keys7 = Object.keys(el), _length7 = _Object$keys7.length; _i7 < _length7; _i7++) {
                    var prop = _Object$keys7[_i7];
                    if (!/^__reactInternalInstance/.test(prop)) continue;

                    return getComponentInstance(el[prop]);
                }

                return null;
            }

            function getComponentKey(component) {
                const currentElement = component._reactInternalInstance ? component._reactInternalInstance._currentElement : component;

                return currentElement.key;
            }

            /*eslint-disable no-unused-vars*/
            function getReact(node, fn) {
                /*eslint-enable no-unused-vars*/
                const componentInstance = getComponentForDOMNode(node);

                if (!componentInstance) return null;

                delete window['%testCafeReactSelector%'];

                if (typeof fn === 'function') {
                    return fn({
                        state: copyReactObject(componentInstance.state),
                        props: copyReactObject(componentInstance.props),
                        key: getComponentKey(componentInstance)
                    });
                }

                return {
                    state: copyReactObject(componentInstance.state),
                    props: copyReactObject(componentInstance.props),
                    key: getComponentKey(componentInstance)
                };
            }

            function getFoundComponentInstances() {
                return window['%testCafeReactFoundComponents%'].map(desc => desc.component);
            }

            function scanDOMNodeForReactComponent(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                let component = null;

                for (let _i8 = 0, _Object$keys8 = Object.keys(el), _length8 = _Object$keys8.length; _i8 < _length8; _i8++) {
                    const prop = _Object$keys8[_i8];
                    if (!/^__reactInternalInstance/.test(prop)) continue;

                    component = el[prop];

                    break;
                }

                if (!component) return null;

                const parent = component._hostParent;

                if (!parent) return component;

                const renderedChildren = parent._renderedChildren;
                const renderedChildrenKeys = Object.keys(renderedChildren);

                const currentElementId = renderedChildrenKeys.filter(key => {
                    const renderedComponent = renderedChildren[key];

                    return renderedComponent && renderedComponent.getHostNode() === el;
                })[0];

                return renderedChildren[currentElementId];
            }

            return {
                getReact,
                getComponentForDOMNode,
                scanDOMNodeForReactComponent,
                getFoundComponentInstances,
                getComponentKey
            };
        }();

        const react16Utils = /*global window Node*/
        function () {
            const ELEMENT_NODE = 1;
            const COMMENT_NODE = 8;

            function copyReactObject(obj) {
                var copiedObj = {};

                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && prop !== 'children') copiedObj[prop] = obj[prop];
                }

                return copiedObj;
            }

            function getComponentForDOMNode(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                let component = null;
                const emptyComponentFound = window['%testCafeReactEmptyComponent%'] && window['%testCafeReactEmptyComponent%'].length;

                if (emptyComponentFound && el.nodeType === COMMENT_NODE) component = window['%testCafeReactEmptyComponent%'].shift().__$$reactInstance;else if (window['%testCafeReactFoundComponents%'].length) component = window['%testCafeReactFoundComponents%'].filter(desc => desc.node === el)[0].component;

                const props = component.stateNode && component.stateNode.props || component.memoizedProps;
                const state = component.stateNode && component.stateNode.state || component.memoizedState;
                const key = component.key;

                return { props, state, key };
            }

            /*eslint-enable no-unused-vars*/
            function getReact(node, fn) {
                /*eslint-disable no-unused-vars*/
                const componentInstance = getComponentForDOMNode(node);

                if (!componentInstance) return null;

                delete window['%testCafeReactSelector%'];
                delete window['%testCafeReactEmptyComponent%'];
                delete window['%testCafeReactFoundComponents%'];

                if (typeof fn === 'function') {
                    return fn({
                        state: copyReactObject(componentInstance.state),
                        props: copyReactObject(componentInstance.props),
                        key: componentInstance.key
                    });
                }

                return {
                    state: copyReactObject(componentInstance.state),
                    props: copyReactObject(componentInstance.props),
                    key: componentInstance.key
                };
            }

            function scanDOMNodeForReactInstance(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                if (el.nodeType === COMMENT_NODE) return el.__$$reactInstance.return.child;

                for (let _i9 = 0, _Object$keys9 = Object.keys(el), _length9 = _Object$keys9.length; _i9 < _length9; _i9++) {
                    var prop = _Object$keys9[_i9];
                    if (!/^__reactInternalInstance/.test(prop)) continue;

                    let nestedComponent = el[prop];

                    if (typeof nestedComponent.type !== 'string') return nestedComponent;

                    let parentComponent = nestedComponent;

                    do {
                        nestedComponent = parentComponent;
                        parentComponent = nestedComponent.return;
                    } while (parentComponent && parentComponent.type && !(parentComponent.stateNode instanceof Node));

                    return nestedComponent;
                }

                return null;
            }

            function getRenderedComponentVersion(component, rootInstances) {
                if (!component.alternate) return component;

                let component1 = component;
                let component2 = component.alternate;

                while (component1.return) component1 = component1.return;
                while (component2.return) component2 = component2.return;

                if (rootInstances.indexOf(component1) > -1) return component;

                return component.alternate;
            }

            function scanDOMNodeForReactComponent(domNode) {
                const rootInstances = window['$testCafeReact16Roots'].map(rootEl => rootEl.return || rootEl);
                const reactInstance = scanDOMNodeForReactInstance(domNode);

                return getRenderedComponentVersion(reactInstance, rootInstances);
            }

            function getFoundComponentInstances() {
                return window['%testCafeReactFoundComponents%'].map(desc => desc.component);
            }

            function getComponentKey(instance) {
                return instance.key;
            }

            return { getReact, getComponentForDOMNode, scanDOMNodeForReactComponent, getFoundComponentInstances, getComponentKey };
        }();

        let filterProps = {};
        let options = null;
        const firstArgsIsObject = isObject(args[0]);

        if (args.length === 2 && firstArgsIsObject) options = args[1];else if (args.length > 2) options = args[2];

        if (args.length < 2 && !firstArgsIsObject) throw new Error(`The "props" option value is expected to be a non-null object, but it is ${typeof args[0]}.`);else if (typeof args[0] !== 'string' && !firstArgsIsObject) throw new Error(`The first argument is expected to be a property name string or a "props" non-null object, but it is ${typeof args[0]}.`);

        if (options && typeof options !== 'object' && !Array.isArray(args[0])) throw new Error(`The "options" value is expected to be an object, but it is ${typeof options}.`);

        if (args.length > 1) {
            if (firstArgsIsObject) filterProps = args[0];else filterProps[args[0]] = args[1];
        } else if (args[0]) filterProps = args[0];

        let getComponentForDOMNode = reactVersion === 15 ? react15Utils.getComponentForDOMNode : react16Utils.getComponentForDOMNode;

        const filteredNodes = [];
        const exactObjectMatch = options && options.exactObjectMatch || false;

        const foundInstances = nodes.filter(node => {
            const componentInstance = getComponentForDOMNode(node);

            if (componentInstance && componentHasProps(componentInstance, filterProps, exactObjectMatch)) {
                filteredNodes.push(node);

                return true;
            }
        });

        return foundInstances;
    },

    withKey: (nodes, key) => {
        if (key === void 0 || key === null) return [];

        const keyString = key.toString();

        window['%testCafeReactFoundComponents%'] = window['%testCafeReactFoundComponents%'].filter(component => {
            return nodes.indexOf(component.node) > -1;
        });

        const reactVersion = window['%testCafeReactVersion%'];
        const react15Utils = /*global window*/
        function () {
            const ELEMENT_NODE = 1;
            const COMMENT_NODE = 8;
            const utils = window['%testCafeReactSelectorUtils%'];

            function copyReactObject(obj) {
                var copiedObj = {};

                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && prop !== 'children') copiedObj[prop] = obj[prop];
                }

                return copiedObj;
            }

            function getComponentInstance(component) {
                const parent = component._hostParent || component;
                const renderedChildren = parent._renderedChildren || { _: component._renderedComponent } || {};
                const renderedChildrenKeys = Object.keys(renderedChildren);
                const componentName = window['%testCafeReactSelector%'];

                for (let index = 0; index < renderedChildrenKeys.length; ++index) {
                    const key = renderedChildrenKeys[index];
                    let renderedComponent = renderedChildren[key];
                    let componentInstance = null;

                    while (renderedComponent) {
                        if (componentName === utils.getName(renderedComponent)) componentInstance = renderedComponent._instance || renderedComponent._currentElement;

                        if (renderedComponent._domID === component._domID) return componentInstance;

                        renderedComponent = renderedComponent._renderedComponent;
                    }
                }

                return null;
            }

            function getComponentForDOMNode(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                const isRootNode = el.hasAttribute && el.hasAttribute('data-reactroot');
                const componentName = window['%testCafeReactSelector%'];

                if (isRootNode) {
                    const rootComponent = utils.getRootComponent(el);

                    //NOTE: check if it's not a portal component
                    if (utils.getName(rootComponent) === componentName) return rootComponent._instance;

                    return getComponentInstance(rootComponent);
                }

                for (let _i10 = 0, _Object$keys10 = Object.keys(el), _length10 = _Object$keys10.length; _i10 < _length10; _i10++) {
                    var prop = _Object$keys10[_i10];
                    if (!/^__reactInternalInstance/.test(prop)) continue;

                    return getComponentInstance(el[prop]);
                }

                return null;
            }

            function getComponentKey(component) {
                const currentElement = component._reactInternalInstance ? component._reactInternalInstance._currentElement : component;

                return currentElement.key;
            }

            /*eslint-disable no-unused-vars*/
            function getReact(node, fn) {
                /*eslint-enable no-unused-vars*/
                const componentInstance = getComponentForDOMNode(node);

                if (!componentInstance) return null;

                delete window['%testCafeReactSelector%'];

                if (typeof fn === 'function') {
                    return fn({
                        state: copyReactObject(componentInstance.state),
                        props: copyReactObject(componentInstance.props),
                        key: getComponentKey(componentInstance)
                    });
                }

                return {
                    state: copyReactObject(componentInstance.state),
                    props: copyReactObject(componentInstance.props),
                    key: getComponentKey(componentInstance)
                };
            }

            function getFoundComponentInstances() {
                return window['%testCafeReactFoundComponents%'].map(desc => desc.component);
            }

            function scanDOMNodeForReactComponent(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                let component = null;

                for (let _i11 = 0, _Object$keys11 = Object.keys(el), _length11 = _Object$keys11.length; _i11 < _length11; _i11++) {
                    const prop = _Object$keys11[_i11];
                    if (!/^__reactInternalInstance/.test(prop)) continue;

                    component = el[prop];

                    break;
                }

                if (!component) return null;

                const parent = component._hostParent;

                if (!parent) return component;

                const renderedChildren = parent._renderedChildren;
                const renderedChildrenKeys = Object.keys(renderedChildren);

                const currentElementId = renderedChildrenKeys.filter(key => {
                    const renderedComponent = renderedChildren[key];

                    return renderedComponent && renderedComponent.getHostNode() === el;
                })[0];

                return renderedChildren[currentElementId];
            }

            return {
                getReact,
                getComponentForDOMNode,
                scanDOMNodeForReactComponent,
                getFoundComponentInstances,
                getComponentKey
            };
        }();

        const react16Utils = /*global window Node*/
        function () {
            const ELEMENT_NODE = 1;
            const COMMENT_NODE = 8;

            function copyReactObject(obj) {
                var copiedObj = {};

                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && prop !== 'children') copiedObj[prop] = obj[prop];
                }

                return copiedObj;
            }

            function getComponentForDOMNode(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                let component = null;
                const emptyComponentFound = window['%testCafeReactEmptyComponent%'] && window['%testCafeReactEmptyComponent%'].length;

                if (emptyComponentFound && el.nodeType === COMMENT_NODE) component = window['%testCafeReactEmptyComponent%'].shift().__$$reactInstance;else if (window['%testCafeReactFoundComponents%'].length) component = window['%testCafeReactFoundComponents%'].filter(desc => desc.node === el)[0].component;

                const props = component.stateNode && component.stateNode.props || component.memoizedProps;
                const state = component.stateNode && component.stateNode.state || component.memoizedState;
                const key = component.key;

                return { props, state, key };
            }

            /*eslint-enable no-unused-vars*/
            function getReact(node, fn) {
                /*eslint-disable no-unused-vars*/
                const componentInstance = getComponentForDOMNode(node);

                if (!componentInstance) return null;

                delete window['%testCafeReactSelector%'];
                delete window['%testCafeReactEmptyComponent%'];
                delete window['%testCafeReactFoundComponents%'];

                if (typeof fn === 'function') {
                    return fn({
                        state: copyReactObject(componentInstance.state),
                        props: copyReactObject(componentInstance.props),
                        key: componentInstance.key
                    });
                }

                return {
                    state: copyReactObject(componentInstance.state),
                    props: copyReactObject(componentInstance.props),
                    key: componentInstance.key
                };
            }

            function scanDOMNodeForReactInstance(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                if (el.nodeType === COMMENT_NODE) return el.__$$reactInstance.return.child;

                for (let _i12 = 0, _Object$keys12 = Object.keys(el), _length12 = _Object$keys12.length; _i12 < _length12; _i12++) {
                    var prop = _Object$keys12[_i12];
                    if (!/^__reactInternalInstance/.test(prop)) continue;

                    let nestedComponent = el[prop];

                    if (typeof nestedComponent.type !== 'string') return nestedComponent;

                    let parentComponent = nestedComponent;

                    do {
                        nestedComponent = parentComponent;
                        parentComponent = nestedComponent.return;
                    } while (parentComponent && parentComponent.type && !(parentComponent.stateNode instanceof Node));

                    return nestedComponent;
                }

                return null;
            }

            function getRenderedComponentVersion(component, rootInstances) {
                if (!component.alternate) return component;

                let component1 = component;
                let component2 = component.alternate;

                while (component1.return) component1 = component1.return;
                while (component2.return) component2 = component2.return;

                if (rootInstances.indexOf(component1) > -1) return component;

                return component.alternate;
            }

            function scanDOMNodeForReactComponent(domNode) {
                const rootInstances = window['$testCafeReact16Roots'].map(rootEl => rootEl.return || rootEl);
                const reactInstance = scanDOMNodeForReactInstance(domNode);

                return getRenderedComponentVersion(reactInstance, rootInstances);
            }

            function getFoundComponentInstances() {
                return window['%testCafeReactFoundComponents%'].map(desc => desc.component);
            }

            function getComponentKey(instance) {
                return instance.key;
            }

            return { getReact, getComponentForDOMNode, scanDOMNodeForReactComponent, getFoundComponentInstances, getComponentKey };
        }();

        const reactUtils = reactVersion === 15 ? react15Utils : react16Utils;

        let getComponentForDOMNode = reactUtils.getComponentForDOMNode;
        let getComponentKey = reactUtils.getComponentKey;

        const filteredNodes = [];

        const foundInstances = nodes.filter(node => {
            const componentInstance = getComponentForDOMNode(node);
            const componentKey = getComponentKey(componentInstance);

            if (componentInstance && componentKey === keyString) {
                filteredNodes.push(node);

                return true;
            }
        });

        return foundInstances;
    },

    findReact: (nodes, selector) => {
        const reactVersion = window['%testCafeReactVersion%'];
        const react15Utils = /*global window*/
        function () {
            const ELEMENT_NODE = 1;
            const COMMENT_NODE = 8;
            const utils = window['%testCafeReactSelectorUtils%'];

            function copyReactObject(obj) {
                var copiedObj = {};

                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && prop !== 'children') copiedObj[prop] = obj[prop];
                }

                return copiedObj;
            }

            function getComponentInstance(component) {
                const parent = component._hostParent || component;
                const renderedChildren = parent._renderedChildren || { _: component._renderedComponent } || {};
                const renderedChildrenKeys = Object.keys(renderedChildren);
                const componentName = window['%testCafeReactSelector%'];

                for (let index = 0; index < renderedChildrenKeys.length; ++index) {
                    const key = renderedChildrenKeys[index];
                    let renderedComponent = renderedChildren[key];
                    let componentInstance = null;

                    while (renderedComponent) {
                        if (componentName === utils.getName(renderedComponent)) componentInstance = renderedComponent._instance || renderedComponent._currentElement;

                        if (renderedComponent._domID === component._domID) return componentInstance;

                        renderedComponent = renderedComponent._renderedComponent;
                    }
                }

                return null;
            }

            function getComponentForDOMNode(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                const isRootNode = el.hasAttribute && el.hasAttribute('data-reactroot');
                const componentName = window['%testCafeReactSelector%'];

                if (isRootNode) {
                    const rootComponent = utils.getRootComponent(el);

                    //NOTE: check if it's not a portal component
                    if (utils.getName(rootComponent) === componentName) return rootComponent._instance;

                    return getComponentInstance(rootComponent);
                }

                for (let _i13 = 0, _Object$keys13 = Object.keys(el), _length13 = _Object$keys13.length; _i13 < _length13; _i13++) {
                    var prop = _Object$keys13[_i13];
                    if (!/^__reactInternalInstance/.test(prop)) continue;

                    return getComponentInstance(el[prop]);
                }

                return null;
            }

            function getComponentKey(component) {
                const currentElement = component._reactInternalInstance ? component._reactInternalInstance._currentElement : component;

                return currentElement.key;
            }

            /*eslint-disable no-unused-vars*/
            function getReact(node, fn) {
                /*eslint-enable no-unused-vars*/
                const componentInstance = getComponentForDOMNode(node);

                if (!componentInstance) return null;

                delete window['%testCafeReactSelector%'];

                if (typeof fn === 'function') {
                    return fn({
                        state: copyReactObject(componentInstance.state),
                        props: copyReactObject(componentInstance.props),
                        key: getComponentKey(componentInstance)
                    });
                }

                return {
                    state: copyReactObject(componentInstance.state),
                    props: copyReactObject(componentInstance.props),
                    key: getComponentKey(componentInstance)
                };
            }

            function getFoundComponentInstances() {
                return window['%testCafeReactFoundComponents%'].map(desc => desc.component);
            }

            function scanDOMNodeForReactComponent(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                let component = null;

                for (let _i14 = 0, _Object$keys14 = Object.keys(el), _length14 = _Object$keys14.length; _i14 < _length14; _i14++) {
                    const prop = _Object$keys14[_i14];
                    if (!/^__reactInternalInstance/.test(prop)) continue;

                    component = el[prop];

                    break;
                }

                if (!component) return null;

                const parent = component._hostParent;

                if (!parent) return component;

                const renderedChildren = parent._renderedChildren;
                const renderedChildrenKeys = Object.keys(renderedChildren);

                const currentElementId = renderedChildrenKeys.filter(key => {
                    const renderedComponent = renderedChildren[key];

                    return renderedComponent && renderedComponent.getHostNode() === el;
                })[0];

                return renderedChildren[currentElementId];
            }

            return {
                getReact,
                getComponentForDOMNode,
                scanDOMNodeForReactComponent,
                getFoundComponentInstances,
                getComponentKey
            };
        }();

        const react16Utils = /*global window Node*/
        function () {
            const ELEMENT_NODE = 1;
            const COMMENT_NODE = 8;

            function copyReactObject(obj) {
                var copiedObj = {};

                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && prop !== 'children') copiedObj[prop] = obj[prop];
                }

                return copiedObj;
            }

            function getComponentForDOMNode(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                let component = null;
                const emptyComponentFound = window['%testCafeReactEmptyComponent%'] && window['%testCafeReactEmptyComponent%'].length;

                if (emptyComponentFound && el.nodeType === COMMENT_NODE) component = window['%testCafeReactEmptyComponent%'].shift().__$$reactInstance;else if (window['%testCafeReactFoundComponents%'].length) component = window['%testCafeReactFoundComponents%'].filter(desc => desc.node === el)[0].component;

                const props = component.stateNode && component.stateNode.props || component.memoizedProps;
                const state = component.stateNode && component.stateNode.state || component.memoizedState;
                const key = component.key;

                return { props, state, key };
            }

            /*eslint-enable no-unused-vars*/
            function getReact(node, fn) {
                /*eslint-disable no-unused-vars*/
                const componentInstance = getComponentForDOMNode(node);

                if (!componentInstance) return null;

                delete window['%testCafeReactSelector%'];
                delete window['%testCafeReactEmptyComponent%'];
                delete window['%testCafeReactFoundComponents%'];

                if (typeof fn === 'function') {
                    return fn({
                        state: copyReactObject(componentInstance.state),
                        props: copyReactObject(componentInstance.props),
                        key: componentInstance.key
                    });
                }

                return {
                    state: copyReactObject(componentInstance.state),
                    props: copyReactObject(componentInstance.props),
                    key: componentInstance.key
                };
            }

            function scanDOMNodeForReactInstance(el) {
                if (!el || !(el.nodeType === ELEMENT_NODE || el.nodeType === COMMENT_NODE)) return null;

                if (el.nodeType === COMMENT_NODE) return el.__$$reactInstance.return.child;

                for (let _i15 = 0, _Object$keys15 = Object.keys(el), _length15 = _Object$keys15.length; _i15 < _length15; _i15++) {
                    var prop = _Object$keys15[_i15];
                    if (!/^__reactInternalInstance/.test(prop)) continue;

                    let nestedComponent = el[prop];

                    if (typeof nestedComponent.type !== 'string') return nestedComponent;

                    let parentComponent = nestedComponent;

                    do {
                        nestedComponent = parentComponent;
                        parentComponent = nestedComponent.return;
                    } while (parentComponent && parentComponent.type && !(parentComponent.stateNode instanceof Node));

                    return nestedComponent;
                }

                return null;
            }

            function getRenderedComponentVersion(component, rootInstances) {
                if (!component.alternate) return component;

                let component1 = component;
                let component2 = component.alternate;

                while (component1.return) component1 = component1.return;
                while (component2.return) component2 = component2.return;

                if (rootInstances.indexOf(component1) > -1) return component;

                return component.alternate;
            }

            function scanDOMNodeForReactComponent(domNode) {
                const rootInstances = window['$testCafeReact16Roots'].map(rootEl => rootEl.return || rootEl);
                const reactInstance = scanDOMNodeForReactInstance(domNode);

                return getRenderedComponentVersion(reactInstance, rootInstances);
            }

            function getFoundComponentInstances() {
                return window['%testCafeReactFoundComponents%'].map(desc => desc.component);
            }

            function getComponentKey(instance) {
                return instance.key;
            }

            return { getReact, getComponentForDOMNode, scanDOMNodeForReactComponent, getFoundComponentInstances, getComponentKey };
        }();

        let componentInstances = null;
        let scanDOMNodeForReactComponent = reactVersion === 15 ? react15Utils.scanDOMNodeForReactComponent : react16Utils.scanDOMNodeForReactComponent;

        componentInstances = nodes.map(scanDOMNodeForReactComponent);

        const reactSelector = window['$testCafeReactSelector'];

        return reactSelector(selector, componentInstances);
    }
}, { returnDOMNodes: true }); /*global document window*/
const waitForReact = /*global ClientFunction document NodeFilter*/

/*eslint-disable no-unused-vars*/
exports.waitForReact = function waitForReact(timeout, testController) {
    /*eslint-enable no-unused-vars*/
    const DEFAULT_TIMEOUT = 1e4;
    const checkTimeout = typeof timeout === 'number' ? timeout : DEFAULT_TIMEOUT;

    return (0, _testcafe.ClientFunction)(() => {
        const CHECK_INTERVAL = 200;
        let stopChecking = false;

        function findReact16Root() {
            const treeWalker = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT, null, false);

            while (treeWalker.nextNode()) if (treeWalker.currentNode.hasOwnProperty('_reactRootContainer')) return true;

            return false;
        }

        function findReact15OrStaticRenderedRoot() {
            const rootEl = document.querySelector('[data-reactroot]');

            //NOTE: we have data-reactroot in static render even before hydration
            return rootEl && Object.keys(rootEl).some(prop => /^__reactInternalInstance/.test(prop));
        }

        function findReactApp() {
            const isReact15OrStaticRender = findReact15OrStaticRenderedRoot();
            const isReact16WithHandlers = !!Object.keys(document).filter(prop => /^_reactListenersID/.test(prop)).length;

            return isReact15OrStaticRender || isReact16WithHandlers || findReact16Root();
        }

        return new Promise((resolve, reject) => {
            function tryFindReactApp() {
                const startTime = new Date();
                const reactTreeIsFound = findReactApp();
                const checkTime = new Date() - startTime;

                if (reactTreeIsFound) {
                    resolve();
                    return;
                }

                if (stopChecking) return;

                setTimeout(tryFindReactApp, checkTime > CHECK_INTERVAL ? checkTime : CHECK_INTERVAL);
            }

            tryFindReactApp();

            setTimeout(() => {
                stopChecking = true;

                reject('waitForReact: The waiting timeout is exceeded');
            }, checkTimeout);
        });
    }, { dependencies: { checkTimeout }, boundTestRun: testController })();
};