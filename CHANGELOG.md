### 7/2/2024 at 4:20 AM
Cloning Items procedure
GameObject relative init
GameObject clipping option

Generic Color object
CloneFactory

EditableGroup moved rotators farer from center
Clone elements by dragging with Alt button
Better scaling elements in group. TODO: Still have a bug with rotation + need to add origin point logic
Rotators now can stick to 15 degrees by pressing Shift while rotating

Video can be inserted. Current frame is attached to timeline

Properties Pane:
Rotation is displayed in degrees
Add `ui` props to Property.PropertyItem (getter, setter, step, precision)

Fixed memory Color lerping

Elements Pane:
Nested list of elements
Items selected in pane are selected on canvas + vise versa

Simple Toolbar for switching and displaying current edit mode

StateManager placeholder

Refactor:
Rename project to Loopybara
Remove selection from info mode
Selection is a separate object now
Move vector manipulations to vector mode
Vector creation and gizmos moved to vectorAction as Movables

### 6/7/2024 at 5:58 PM
Working resize, move, tween updated to setters, right pane gets\sets values. multivalue WIP

### 6/6/2024 at 4:06 PM
Tween easing selection show props WIP
Properties pane deconstruct and broke

### 6/5/2024 at 6:52 PM
Camera.getChildrenAtRect
working selection rect

### 6/5/2024 at 5:31 PM
Fix: instant drag now select the top item

### 6/5/2024 at 5:27 PM
Vector editor
 Bezier rect calculation
 Vector primitive for editor
 Fix modification area mismatch when frame is changing
 Select Items instead of Glyphs
 Cursors from svg
 Rotate cursors according to direction of modificators
 Resizer is finally working for single object
 D.mouse.dragBehavior now fires move action when keyboard keys are pressed

primitives_v2. Rotate/RotateClone, Projection/ProjectionClone; optimizations

### 6/2/2024 at 11:15 PM
Rotator beginning.
Resizers work fine when no rotation and skew is applied

### 5/31/2024 at 6:10 PM
Camera
 Store all drawn items rects in world coords
 getChildrenAtPoint(Point, ChildType)
 visit(ChildType, fn)
 getRegion(child)

GameObject
 pxRatio is setted by camera
 objectPointToWorld(Point)

engine/Generic/Union generic intersection operations:
 intersect(list1, list2, key)
 xor(list1, list2, key)

Tween decomposed to a lot of files
Tween easing can be changed to random one by clicking on the icon.
Tween easing is drawn
Tween speed up, reduce GC impact

Add Interfaces: Item, Interact

Move operation is working great, select multiple items by Ctrl+click is also working as expected. Area selection is not implemented yet

VerticalFlex component

primitive Point min, max fns

### 5/22/2024 at 6:27 AM
Add D.CSS for dynamic styles. Move keyframes dom to separate file

### 5/21/2024 at 4:58 PM
Animation Tween KeyFrames are movable, between frames animation!
KeyFrame draw with pool optimization
a lot of tween UI logic
NumberInput now use animation frame for update

### 5/18/2024 at 6:21 PM
Animation Tween WIP!