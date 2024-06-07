Tween.prototype.initDOM = function(cfg){
  this.dom = D.h('div', {cls: ['tween', cfg.cls]},
    D.h('div', {cls: 'tween-layout'},
      D.div({cls: 'tween-properties'},
        new BooleanInput({
          label: 'Play',
          bind: this.play,
          leftLabel: 'Pause'
        }),

        new BooleanInput({
          label: 'Debug',
          bind: this.debug
        }),

        new NumberInput({
          value: this.currentFrame,
          min: this.startFrame,
          max: this.endFrame,
          precision: 6
        }),

        new NumberInput({
          value: this.startFrame,
          letter: 'Start',
          min: 1,
          max: this.endFrame,
          precision: 6
        }),
        new NumberInput({
          value: this.endFrame,
          letter: 'End',
          min: this.startFrame,
          precision: 6
        }),
      ),
      this.horizontalFlex = new HorizontalFlex({},
        D.div({cls: 'tween__items-layout'},
          D.div({cls: 'tween__items-layout--header'}),
          this.tweenItems = D.div({cls: 'tween__items'}),
        ),
        this.tweenTimelineHolder = D.div({cls: 'tween__timeline--wrap'},
          this.tweenTimelineFramesHeader = D.div({cls: 'tween__timeline-header'}),
          this.tweenTimeline = D.div({cls: 'tween__timeline'},

            this.tweenCanvas = D.h('div', {cls: 'tween__timeline--canvas'}),
            //this.tweenCanvas = D.h('canvas', {cls: 'tween__timeline--canvas'}),
            this.tweenPlayZone = D.div({cls: 'tween__timeline--play-zone'}),
            this.scrollableTween = D.div({cls: 'tween__timeline--scrollable-tween'}),
            this.tweenCurrentFrameLine = D.div({cls: 'tween__timeline--current-frame'}, D.span({cls: 'tween__timeline--current-frame-label'}, this.currentFrame))

          )
        )
      )
    )
  );
  this.initTweenCanvas();
  this.initTweenItems();
  this.initTweenInterconnection();
}