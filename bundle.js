
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function self(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Header.svelte generated by Svelte v3.32.3 */

    const file = "src\\Header.svelte";

    function create_fragment(ctx) {
    	let header;
    	let h1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let ul;
    	let li0;
    	let a0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let li1;
    	let a1;
    	let img2;
    	let img2_src_value;
    	let t2;
    	let li2;
    	let a2;
    	let t4;
    	let li3;
    	let a3;
    	let t6;
    	let li4;
    	let a4;
    	let t8;
    	let li5;
    	let a5;
    	let img3;
    	let img3_src_value;
    	let t9;
    	let li6;
    	let a6;
    	let img4;
    	let img4_src_value;
    	let t10;
    	let div;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			img0 = element("img");
    			t0 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			img1 = element("img");
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			img2 = element("img");
    			t2 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "Wiki";
    			t4 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "Dev Blog";
    			t6 = space();
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Merch";
    			t8 = space();
    			li5 = element("li");
    			a5 = element("a");
    			img3 = element("img");
    			t9 = space();
    			li6 = element("li");
    			a6 = element("a");
    			img4 = element("img");
    			t10 = space();
    			div = element("div");
    			if (img0.src !== (img0_src_value = "/images/logo.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Wastenauts");
    			attr_dev(img0, "class", "svelte-10dbn7m");
    			add_location(img0, file, 41, 21, 1662);
    			attr_dev(h1, "class", "logo svelte-10dbn7m");
    			add_location(h1, file, 41, 4, 1645);
    			if (img1.src !== (img1_src_value = "/images/logo-steam.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Download on Steam");
    			add_location(img1, file, 43, 82, 1806);
    			attr_dev(a0, "href", "https://store.steampowered.com/app/1357590/");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "svelte-10dbn7m");
    			add_location(a0, file, 43, 12, 1736);
    			attr_dev(li0, "class", "svelte-10dbn7m");
    			add_location(li0, file, 43, 8, 1732);
    			if (img2.src !== (img2_src_value = "/images/logo-gamejolt.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Download on Game Jolt");
    			add_location(img2, file, 44, 81, 1956);
    			attr_dev(a1, "href", "https://gamejolt.com/games/fromrust/470569");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "svelte-10dbn7m");
    			add_location(a1, file, 44, 12, 1887);
    			attr_dev(li1, "class", "svelte-10dbn7m");
    			add_location(li1, file, 44, 8, 1883);
    			attr_dev(a2, "href", "https://wastenauts.fandom.com/wiki/Wastenauts_Wiki");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "class", "svelte-10dbn7m");
    			add_location(a2, file, 45, 25, 2057);
    			attr_dev(li2, "class", "info svelte-10dbn7m");
    			add_location(li2, file, 45, 8, 2040);
    			attr_dev(a3, "href", "https://wastenauts.tumblr.com/");
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "class", "svelte-10dbn7m");
    			add_location(a3, file, 46, 25, 2174);
    			attr_dev(li3, "class", "info svelte-10dbn7m");
    			add_location(li3, file, 46, 8, 2157);
    			attr_dev(a4, "href", "https://razburygames.threadless.com");
    			attr_dev(a4, "target", "_blank");
    			attr_dev(a4, "class", "svelte-10dbn7m");
    			add_location(a4, file, 47, 25, 2275);
    			attr_dev(li4, "class", "info svelte-10dbn7m");
    			add_location(li4, file, 47, 8, 2258);
    			if (img3.src !== (img3_src_value = "images/icon-discord.svg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Discord");
    			attr_dev(img3, "width", "20");
    			add_location(img3, file, 48, 64, 2417);
    			attr_dev(a5, "href", "https://discord.gg/uCUeWKG");
    			attr_dev(a5, "class", "svelte-10dbn7m");
    			add_location(a5, file, 48, 27, 2380);
    			attr_dev(li5, "class", "social svelte-10dbn7m");
    			add_location(li5, file, 48, 8, 2361);
    			if (img4.src !== (img4_src_value = "images/icon-twitter.svg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Twitter");
    			attr_dev(img4, "width", "22");
    			add_location(img4, file, 49, 88, 2576);
    			attr_dev(a6, "href", "https://twitter.com/WastenautsGame");
    			attr_dev(a6, "target", "_blank");
    			attr_dev(a6, "class", "svelte-10dbn7m");
    			add_location(a6, file, 49, 27, 2515);
    			attr_dev(li6, "class", "social svelte-10dbn7m");
    			add_location(li6, file, 49, 8, 2496);
    			attr_dev(ul, "class", "svelte-10dbn7m");
    			add_location(ul, file, 42, 4, 1718);
    			attr_dev(header, "class", "main-nav svelte-10dbn7m");
    			add_location(header, file, 40, 0, 1614);
    			attr_dev(div, "class", "comic-borders svelte-10dbn7m");
    			add_location(div, file, 52, 0, 2669);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(h1, img0);
    			append_dev(header, t0);
    			append_dev(header, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, img1);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, img2);
    			append_dev(ul, t2);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(ul, t4);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(ul, t6);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    			append_dev(ul, t8);
    			append_dev(ul, li5);
    			append_dev(li5, a5);
    			append_dev(a5, img3);
    			append_dev(ul, t9);
    			append_dev(ul, li6);
    			append_dev(li6, a6);
    			append_dev(a6, img4);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\Modal.svelte generated by Svelte v3.32.3 */

    const file$1 = "src\\Modal.svelte";

    // (31:0) {#if showModal}
    function create_if_block(ctx) {
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "Close";
    			if (img.src !== (img_src_value = "images/" + /*imagePath*/ ctx[0] + ".jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1uqi3q4");
    			add_location(img, file$1, 34, 8, 1236);
    			attr_dev(span, "class", "svelte-1uqi3q4");
    			add_location(span, file$1, 35, 41, 1328);
    			attr_dev(div0, "class", "close svelte-1uqi3q4");
    			add_location(div0, file$1, 35, 8, 1295);
    			attr_dev(div1, "class", "modal svelte-1uqi3q4");
    			add_location(div1, file$1, 33, 4, 1200);
    			attr_dev(div2, "class", "window-shade svelte-1uqi3q4");
    			add_location(div2, file$1, 31, 0, 1148);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, span);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", self(/*click_handler_1*/ ctx[3]), false, false, false),
    					listen_dev(div2, "click", self(/*click_handler*/ ctx[2]), false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*imagePath*/ 1 && img.src !== (img_src_value = "images/" + /*imagePath*/ ctx[0] + ".jpg")) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(31:0) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*showModal*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showModal*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, []);
    	let { imagePath = 1 } = $$props;
    	let { showModal = false } = $$props;
    	const writable_props = ["imagePath", "showModal"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("imagePath" in $$props) $$invalidate(0, imagePath = $$props.imagePath);
    		if ("showModal" in $$props) $$invalidate(1, showModal = $$props.showModal);
    	};

    	$$self.$capture_state = () => ({ imagePath, showModal });

    	$$self.$inject_state = $$props => {
    		if ("imagePath" in $$props) $$invalidate(0, imagePath = $$props.imagePath);
    		if ("showModal" in $$props) $$invalidate(1, showModal = $$props.showModal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imagePath, showModal, click_handler, click_handler_1];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { imagePath: 0, showModal: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get imagePath() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imagePath(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showModal() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showModal(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.32.3 */
    const file$2 = "src\\App.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let header;
    	let t0;
    	let modal;
    	let t1;
    	let div2;
    	let div1;
    	let div0;
    	let h20;
    	let t3;
    	let p0;
    	let t5;
    	let a;
    	let t7;
    	let div6;
    	let div3;
    	let t8;
    	let div4;
    	let iframe;
    	let iframe_src_value;
    	let t9;
    	let div5;
    	let t10;
    	let div11;
    	let div8;
    	let div7;
    	let h21;
    	let t12;
    	let p1;
    	let t14;
    	let div9;
    	let ul0;
    	let li0;
    	let img0;
    	let img0_src_value;
    	let t15;
    	let li1;
    	let img1;
    	let img1_src_value;
    	let t16;
    	let li2;
    	let img2;
    	let img2_src_value;
    	let t17;
    	let div10;
    	let t18;
    	let div16;
    	let div13;
    	let div12;
    	let h22;
    	let t20;
    	let p2;
    	let t22;
    	let div14;
    	let ul1;
    	let li3;
    	let img3;
    	let img3_src_value;
    	let t23;
    	let li4;
    	let img4;
    	let img4_src_value;
    	let t24;
    	let li5;
    	let img5;
    	let img5_src_value;
    	let t25;
    	let div15;
    	let t26;
    	let div21;
    	let div18;
    	let div17;
    	let h23;
    	let t28;
    	let p3;
    	let t30;
    	let div19;
    	let ul2;
    	let li6;
    	let img6;
    	let img6_src_value;
    	let t31;
    	let li7;
    	let img7;
    	let img7_src_value;
    	let t32;
    	let li8;
    	let img8;
    	let img8_src_value;
    	let t33;
    	let div20;
    	let current;
    	let mounted;
    	let dispose;
    	header = new Header({ $$inline: true });

    	modal = new Modal({
    			props: {
    				imagePath: /*imagePath*/ ctx[1],
    				showModal: /*showModal*/ ctx[0]
    			},
    			$$inline: true
    		});

    	modal.$on("click", /*toggleModal*/ ctx[2]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(modal.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "So you wanna be a diver?";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Grab your friends and explore what’s left of the surface of Earth. Fight some machines. Blow ‘em up for parts. Put the parts back together to make cool toys. Or sell ‘em. You do you, Diver.";
    			t5 = space();
    			a = element("a");
    			a.textContent = "Now on Kickstarter!";
    			t7 = space();
    			div6 = element("div");
    			div3 = element("div");
    			t8 = space();
    			div4 = element("div");
    			iframe = element("iframe");
    			t9 = space();
    			div5 = element("div");
    			t10 = space();
    			div11 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			h21 = element("h2");
    			h21.textContent = "An Ever-Changing Wasteland";
    			t12 = space();
    			p1 = element("p");
    			p1.textContent = "No two game sessions will ever be quite the same. You’re exploring - and fighting against - a location deck, and what goes into that deck, well, who knows?";
    			t14 = space();
    			div9 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			img0 = element("img");
    			t15 = space();
    			li1 = element("li");
    			img1 = element("img");
    			t16 = space();
    			li2 = element("li");
    			img2 = element("img");
    			t17 = space();
    			div10 = element("div");
    			t18 = space();
    			div16 = element("div");
    			div13 = element("div");
    			div12 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Drop in Solo, or With Friends";
    			t20 = space();
    			p2 = element("p");
    			p2.textContent = "As long-time board and card game fans, we built this game to play with each other. That doesn’t mean you can't go it solo - the party’s four characters can be controlled by one to four players.";
    			t22 = space();
    			div14 = element("div");
    			ul1 = element("ul");
    			li3 = element("li");
    			img3 = element("img");
    			t23 = space();
    			li4 = element("li");
    			img4 = element("img");
    			t24 = space();
    			li5 = element("li");
    			img5 = element("img");
    			t25 = space();
    			div15 = element("div");
    			t26 = space();
    			div21 = element("div");
    			div18 = element("div");
    			div17 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Bring-Your-Own-Game";
    			t28 = space();
    			p3 = element("p");
    			p3.textContent = "In Adventure Mode, you craft the location deck. Stuff it full of monsters, or just put in a bunch of loot. Easy, hard, brutal - build the experience you want to play and then grab a few friends to share it with.";
    			t30 = space();
    			div19 = element("div");
    			ul2 = element("ul");
    			li6 = element("li");
    			img6 = element("img");
    			t31 = space();
    			li7 = element("li");
    			img7 = element("img");
    			t32 = space();
    			li8 = element("li");
    			img8 = element("img");
    			t33 = space();
    			div20 = element("div");
    			add_location(h20, file$2, 75, 4, 3556);
    			add_location(p0, file$2, 76, 4, 3595);
    			attr_dev(div0, "class", "talktext tri-right border round btm-left-in svelte-1uqqion");
    			add_location(div0, file$2, 74, 3, 3493);
    			attr_dev(div1, "class", "talk-bubble svelte-1uqqion");
    			add_location(div1, file$2, 73, 2, 3463);
    			attr_dev(a, "class", "CTA-btn");
    			attr_dev(a, "href", "https://www.kickstarter.com/projects/razburygames/wastenauts");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$2, 79, 2, 3816);
    			attr_dev(div2, "class", "comic-panel jack svelte-1uqqion");
    			add_location(div2, file$2, 72, 1, 3429);
    			attr_dev(div3, "class", "background-filter svelte-1uqqion");
    			add_location(div3, file$2, 84, 2, 3998);
    			attr_dev(iframe, "title", "Wastenauts Announcement Trailer");
    			set_style(iframe, "width", "100%");
    			set_style(iframe, "height", "100%");
    			if (iframe.src !== (iframe_src_value = "https://www.youtube.com/embed/JEBM7ErIPJs")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "frameborder", "0");
    			attr_dev(iframe, "allow", "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
    			iframe.allowFullscreen = true;
    			add_location(iframe, file$2, 86, 3, 4069);
    			attr_dev(div4, "class", "video-embed svelte-1uqqion");
    			add_location(div4, file$2, 85, 2, 4039);
    			attr_dev(div5, "class", "divider svelte-1uqqion");
    			add_location(div5, file$2, 88, 2, 4340);
    			attr_dev(div6, "class", "comic-panel trailer svelte-1uqqion");
    			add_location(div6, file$2, 83, 1, 3961);
    			add_location(h21, file$2, 94, 4, 4510);
    			add_location(p1, file$2, 95, 4, 4551);
    			attr_dev(div7, "class", "talktext tri-right border round btm-left-in svelte-1uqqion");
    			add_location(div7, file$2, 93, 3, 4447);
    			attr_dev(div8, "class", "talk-bubble svelte-1uqqion");
    			add_location(div8, file$2, 92, 2, 4417);
    			if (img0.src !== (img0_src_value = "images/1-thumb.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-1uqqion");
    			add_location(img0, file$2, 100, 40, 4814);
    			attr_dev(li0, "class", "svelte-1uqqion");
    			add_location(li0, file$2, 100, 4, 4778);
    			if (img1.src !== (img1_src_value = "images/2-thumb.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-1uqqion");
    			add_location(img1, file$2, 101, 40, 4898);
    			attr_dev(li1, "class", "svelte-1uqqion");
    			add_location(li1, file$2, 101, 4, 4862);
    			if (img2.src !== (img2_src_value = "images/3-thumb.jpg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", "svelte-1uqqion");
    			add_location(img2, file$2, 102, 40, 4982);
    			attr_dev(li2, "class", "svelte-1uqqion");
    			add_location(li2, file$2, 102, 4, 4946);
    			attr_dev(ul0, "class", "svelte-1uqqion");
    			add_location(ul0, file$2, 99, 3, 4768);
    			attr_dev(div9, "class", "screenshots svelte-1uqqion");
    			add_location(div9, file$2, 98, 2, 4738);
    			attr_dev(div10, "class", "divider svelte-1uqqion");
    			add_location(div10, file$2, 105, 2, 5048);
    			attr_dev(div11, "class", "comic-panel buster svelte-1uqqion");
    			add_location(div11, file$2, 91, 1, 4381);
    			add_location(h22, file$2, 111, 4, 5218);
    			add_location(p2, file$2, 112, 4, 5262);
    			attr_dev(div12, "class", "talktext tri-right border round btm-left-in svelte-1uqqion");
    			add_location(div12, file$2, 110, 3, 5155);
    			attr_dev(div13, "class", "talk-bubble svelte-1uqqion");
    			add_location(div13, file$2, 109, 2, 5125);
    			if (img3.src !== (img3_src_value = "images/4-thumb.jpg")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			attr_dev(img3, "class", "svelte-1uqqion");
    			add_location(img3, file$2, 117, 40, 5563);
    			attr_dev(li3, "class", "svelte-1uqqion");
    			add_location(li3, file$2, 117, 4, 5527);
    			if (img4.src !== (img4_src_value = "images/5-thumb.jpg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "");
    			attr_dev(img4, "class", "svelte-1uqqion");
    			add_location(img4, file$2, 118, 40, 5647);
    			attr_dev(li4, "class", "svelte-1uqqion");
    			add_location(li4, file$2, 118, 4, 5611);
    			if (img5.src !== (img5_src_value = "images/6-thumb.jpg")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "");
    			attr_dev(img5, "class", "svelte-1uqqion");
    			add_location(img5, file$2, 119, 40, 5731);
    			attr_dev(li5, "class", "svelte-1uqqion");
    			add_location(li5, file$2, 119, 4, 5695);
    			attr_dev(ul1, "class", "svelte-1uqqion");
    			add_location(ul1, file$2, 116, 3, 5517);
    			attr_dev(div14, "class", "screenshots svelte-1uqqion");
    			add_location(div14, file$2, 115, 2, 5487);
    			attr_dev(div15, "class", "divider svelte-1uqqion");
    			add_location(div15, file$2, 122, 2, 5797);
    			attr_dev(div16, "class", "comic-panel andrea svelte-1uqqion");
    			add_location(div16, file$2, 108, 1, 5089);
    			add_location(h23, file$2, 128, 4, 5966);
    			add_location(p3, file$2, 129, 4, 6000);
    			attr_dev(div17, "class", "talktext tri-right border round btm-left-in svelte-1uqqion");
    			add_location(div17, file$2, 127, 3, 5903);
    			attr_dev(div18, "class", "talk-bubble svelte-1uqqion");
    			add_location(div18, file$2, 126, 2, 5873);
    			if (img6.src !== (img6_src_value = "images/7-thumb.jpg")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "");
    			attr_dev(img6, "class", "svelte-1uqqion");
    			add_location(img6, file$2, 134, 40, 6319);
    			attr_dev(li6, "class", "svelte-1uqqion");
    			add_location(li6, file$2, 134, 4, 6283);
    			if (img7.src !== (img7_src_value = "images/8-thumb.jpg")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "");
    			attr_dev(img7, "class", "svelte-1uqqion");
    			add_location(img7, file$2, 135, 40, 6403);
    			attr_dev(li7, "class", "svelte-1uqqion");
    			add_location(li7, file$2, 135, 4, 6367);
    			if (img8.src !== (img8_src_value = "images/9-thumb.jpg")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "");
    			attr_dev(img8, "class", "svelte-1uqqion");
    			add_location(img8, file$2, 136, 40, 6487);
    			attr_dev(li8, "class", "svelte-1uqqion");
    			add_location(li8, file$2, 136, 4, 6451);
    			attr_dev(ul2, "class", "svelte-1uqqion");
    			add_location(ul2, file$2, 133, 3, 6273);
    			attr_dev(div19, "class", "screenshots svelte-1uqqion");
    			add_location(div19, file$2, 132, 2, 6243);
    			attr_dev(div20, "class", "divider svelte-1uqqion");
    			add_location(div20, file$2, 139, 2, 6553);
    			attr_dev(div21, "class", "comic-panel lena svelte-1uqqion");
    			add_location(div21, file$2, 125, 1, 5839);
    			attr_dev(main, "class", "svelte-1uqqion");
    			add_location(main, file$2, 66, 0, 3341);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			mount_component(modal, main, null);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(div2, t5);
    			append_dev(div2, a);
    			append_dev(main, t7);
    			append_dev(main, div6);
    			append_dev(div6, div3);
    			append_dev(div6, t8);
    			append_dev(div6, div4);
    			append_dev(div4, iframe);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			append_dev(main, t10);
    			append_dev(main, div11);
    			append_dev(div11, div8);
    			append_dev(div8, div7);
    			append_dev(div7, h21);
    			append_dev(div7, t12);
    			append_dev(div7, p1);
    			append_dev(div11, t14);
    			append_dev(div11, div9);
    			append_dev(div9, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, img0);
    			append_dev(ul0, t15);
    			append_dev(ul0, li1);
    			append_dev(li1, img1);
    			append_dev(ul0, t16);
    			append_dev(ul0, li2);
    			append_dev(li2, img2);
    			append_dev(div11, t17);
    			append_dev(div11, div10);
    			append_dev(main, t18);
    			append_dev(main, div16);
    			append_dev(div16, div13);
    			append_dev(div13, div12);
    			append_dev(div12, h22);
    			append_dev(div12, t20);
    			append_dev(div12, p2);
    			append_dev(div16, t22);
    			append_dev(div16, div14);
    			append_dev(div14, ul1);
    			append_dev(ul1, li3);
    			append_dev(li3, img3);
    			append_dev(ul1, t23);
    			append_dev(ul1, li4);
    			append_dev(li4, img4);
    			append_dev(ul1, t24);
    			append_dev(ul1, li5);
    			append_dev(li5, img5);
    			append_dev(div16, t25);
    			append_dev(div16, div15);
    			append_dev(main, t26);
    			append_dev(main, div21);
    			append_dev(div21, div18);
    			append_dev(div18, div17);
    			append_dev(div17, h23);
    			append_dev(div17, t28);
    			append_dev(div17, p3);
    			append_dev(div21, t30);
    			append_dev(div21, div19);
    			append_dev(div19, ul2);
    			append_dev(ul2, li6);
    			append_dev(li6, img6);
    			append_dev(ul2, t31);
    			append_dev(ul2, li7);
    			append_dev(li7, img7);
    			append_dev(ul2, t32);
    			append_dev(ul2, li8);
    			append_dev(li8, img8);
    			append_dev(div21, t33);
    			append_dev(div21, div20);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(li0, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(li1, "click", /*click_handler_1*/ ctx[4], false, false, false),
    					listen_dev(li2, "click", /*click_handler_2*/ ctx[5], false, false, false),
    					listen_dev(li3, "click", /*click_handler_3*/ ctx[6], false, false, false),
    					listen_dev(li4, "click", /*click_handler_4*/ ctx[7], false, false, false),
    					listen_dev(li5, "click", /*click_handler_5*/ ctx[8], false, false, false),
    					listen_dev(li6, "click", /*click_handler_6*/ ctx[9], false, false, false),
    					listen_dev(li7, "click", /*click_handler_7*/ ctx[10], false, false, false),
    					listen_dev(li8, "click", /*click_handler_8*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};
    			if (dirty & /*imagePath*/ 2) modal_changes.imagePath = /*imagePath*/ ctx[1];
    			if (dirty & /*showModal*/ 1) modal_changes.showModal = /*showModal*/ ctx[0];
    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(modal);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let showModal = false;
    	let imagePath = 1;

    	const toggleModal = slide => {
    		$$invalidate(0, showModal = !showModal);
    		$$invalidate(1, imagePath = slide);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => toggleModal(1);
    	const click_handler_1 = () => toggleModal(2);
    	const click_handler_2 = () => toggleModal(3);
    	const click_handler_3 = () => toggleModal(4);
    	const click_handler_4 = () => toggleModal(5);
    	const click_handler_5 = () => toggleModal(6);
    	const click_handler_6 = () => toggleModal(7);
    	const click_handler_7 = () => toggleModal(8);
    	const click_handler_8 = () => toggleModal(9);

    	$$self.$capture_state = () => ({
    		Header,
    		Modal,
    		showModal,
    		imagePath,
    		toggleModal
    	});

    	$$self.$inject_state = $$props => {
    		if ("showModal" in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ("imagePath" in $$props) $$invalidate(1, imagePath = $$props.imagePath);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showModal,
    		imagePath,
    		toggleModal,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
