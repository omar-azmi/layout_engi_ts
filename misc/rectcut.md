<style>
body {
	background-color: #000000;
	color: #FFFFFF;
}

pre {
	background-color: #FFFF77;
}
</style>

### The following is copied from [link](https://halt.software/dead-simple-layouts/), but the link is currently dead, so you'll have to access it through [wayback machine](https://web.archive.org/web/20231015110702/https://halt.software/dead-simple-layouts/)

# RectCut for dead simple UI layouts

UI layouts are always a hassle. Whatever layouting system I've made, I was never happy with it 100%. Some lacked simplicity, others lacked control. Recently I came back to a method I call _RectCut_. It is simple, and it gives you control for very complex layouts.

You might have guessed by now that _RectCut_ is based around cutting rectangles. And starts with... well rectangle:
```c
struct Rect {
	float minx, miny, maxx, maxy;
};
```

Second part is four basic functions to cut it:
```c
Rect cut_left(Rect* rect, float a) {
	float minx = rect->minx;
	rect->minx = min(rect->max.x, rect->minx + a);
	return (Rect){ minx, rect->miny, rect->minx, rect->maxy };
}

Rect cut_right(Rect* rect, float a) {
	float maxx = rect->maxx;
	rect->maxx = max(rect->minx, rect->maxx - a);
	return (Rect){ rect->maxx, rect->miny, maxx, rect->maxy };
}

Rect cut_top(Rect* rect, float a) {
	float miny = rect->miny;
	rect->miny = min(rect->max.y, rect->miny + a);
	return (Rect){ rect->minx, miny, rect->maxx, rect->miny };
}

Rect cut_bottom(Rect* rect, float a) {
	float maxy = rect->maxy;
	rect->maxy = max(rect->miny, rect->maxy - a);
	return (Rect){ rect->minx, rect->maxy, rect->maxx, maxy };
}
```

These functions cut a smaller rectangle of an input rectangle and return it. The trick is that they also modify the input rectangle.

## Example: Toolbar

Best first example is probably a toolbar that has buttons on left and right.
```c
Rect layout = { 0, 0, 180, 16 };

Rect r1 = cut_left(&layout, 16);
Rect r2 = cut_left(&layout, 16);
Rect r3 = cut_left(&layout, 16);

Rect r4 = cut_right(&layout, 16);
Rect r5 = cut_right(&layout, 16);
```
![image](https://web.archive.org/web/20231015110702im_/https://halt.software/content/images/2021/03/Sprite-0001.gif)

## Example: Two panel application

```c
// Top bar with icons and title
Rect top = cut_top(&layout, 16);
	Rect button_close = cut_right(&top, 16);
	Rect button_maximize = cut_right(&top, 16);
	Rect button_minimize = cut_right(&top, 16);
	Rect title = top;

// Bottom bar.
Rect bottom = cut_bottom(&layout, 16);

// Left and right panels.
Rect panel_left = cut_left(&layout, w / 2);
Rect panel_right = layout;
```
![image](https://web.archive.org/web/20231015110702im_/https://halt.software/content/images/2021/03/Sprite-0002-1.gif)

## In practice

Sometimes there's a need to first calculate the size and then cut the appropriate amount off. Typical example is a button that sizes by the label:
```c
bool button(Rect* layout, const char* label) {
	float size = measure_text(label);
	Rect rect = cut_left(layout, size);
	// interactions
	// draw
}
```
The problem here is that the button would always call `cut_left` hence you cannot use this to have a toolbar with buttons on left and right. You want to control the side from the caller of `button` function.

A simple wrapper does the trick:
```c
enum RectCutSide {
	RectCut_Left,
	RectCut_Right,
	RectCut_Top,
	RectCut_Bottom,
};

struct RectCut {
	Rect* rect;
	RectCutSide side;
};

RectCut rectcut(Rect* rect, RectCutSide side) {
	return (RectCut) {
		.rect = rect,
		.side = side
	};
}

Rect rectcut_cut(RectCut rectcut, float a) {
	switch (rectcut.side)
	{
		case RectCut_Left:   return cut_left(rectcut->rect,   a);
		case RectCut_Right:  return cut_right(rectcut->rect,  a);
		case RectCut_Top:    return cut_top(rectcut->rect,    a);
		case RectCut_Bottom: return cut_bottom(rectcut->rect, a);
		default: abort();
	}
}
```
Now the `button` would look like this:
```c
bool button(RectCut layout, const char* label) {
	float size = measure_text(label);
	Rect rect = rectcut_cut(layout, size);
	// interactions
	// draw
}
```
And now we get to control the side from the caller and have buttons size themselves by their content:
```c
Rect toolbar = { ... };

button(rectcut(&toolbar, RectCut_Right), "Left");
button(rectcut(&toolbar, RectCut_Left),  "Right");
```

## Extensions

I do have additional set of functions that help me in some cases:
```c
// Same as cut, except they keep the input rect intact.
// Useful for decorations (9-patch-much?).
Rect get_left(const Rect* rect, float a);
Rect get_right(const Rect* rect, float a);
Rect get_top(const Rect* rect, float a);
Rect get_bottom(const Rect* rect, float a);

// These will add a rectangle outside of the input rectangle.
// Useful for tooltips and other overlay elements.
Rect add_left(const Rect* rect, float a);
Rect add_right(const Rect* rect, float a);
Rect add_top(const Rect* rect, float a);
Rect add_bottom(const Rect* rect, float a);
```
Further you can implement `extend` and `contract` functions for `Rect` that are useful for borders and overhangs.

`RectCut` can be also extended to support limiting maximum and minimum width and height to get more control over layout properties. (I've used `nan` to denote "don't apply" for each of the limits).

Hopefully this will unblock you a bit and make you stop implementing overengineered layouts that don't work. I'm guilty of that too.

## Implementations

- [Rust crate by Noah Ryan](https://crates.io/crates/rectcut-rs)

[Comments](https://twitter.com/martin_cohen/status/1367937657544835077)
