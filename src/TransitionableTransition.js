var TWEEN = require("tween.js");
var inherits = require("inherits");

/**
 * @class DisplayTransition
 */
function TransitionableTransition(fromState, toState) {
	this._fromState = fromState;
	this._toState = toState;
	this._target = this._fromState.getTarget();
	this._movieClips = [];
	this._tweenProperties = null;
	this._tween = null;
	this._easing = TWEEN.Easing.Quadratic.InOut;
	this._duration = 200;
	this._isPlaying = false;
	this.complete = null;

	if (!this._target || this._fromState.getTarget() != this._toState.getTarget())
		throw new Error("Something is wrong");
}

/**
 * Play.
 * @method play
 */
TransitionableTransition.prototype.play = function() {
	if (this._isPlaying)
		throw new Error("this shouldn't happen!");

	this._isPlaying = true;
	this._fromState.uninstall();

	for (var i = 0; i < this._movieClips.length; i++) {
		var mc = this._movieClips[i];
		this._target.addChild(mc)
		mc.onComplete = this.onComplete.bind(this);
		mc.loop = false;
		mc.gotoAndPlay(0);
	}

	this._tweenProperties = this._fromState.getProperties();

	this._tween = new TWEEN.Tween(this._tweenProperties);
	this._tween.to(this._toState.getProperties(), this._duration);
	this._tween.easing(this._easing);
	this._tween.onUpdate(this.onTweenUpdate.bind(this));
	this._tween.onComplete(this.onTweenComplete.bind(this));
	this._tween.start();
}

/**
 * On movie clip complete.
 * @method onMovieClipComplete
 * @private
 */
TransitionableTransition.prototype.onMovieClipComplete = function() {
	console.log("movieclip complete: " + this._movieClips[0].playing);
}

/**
 * Tween update.
 * @method onTweenUpdate
 * @private
 */
TransitionableTransition.prototype.onTweenUpdate = function(o) {
	this._target.setStateProperties(this._tweenProperties);
}

/**
 * Tween complete.
 * @method onTweenComplete
 * @private
 */
TransitionableTransition.prototype.onTweenComplete = function() {
	this._tween = null;
	this.onComplete();
}

/**
 * We are complete, report completion.
 * But only once!
 * @method onComplete
 */
TransitionableTransition.prototype.onComplete = function() {
	if (!this._isPlaying)
		return;

	for (var i = 0; i < this._movieClips.length; i++)
		if (this._movieClips[i].playing)
			return;

	if (this._tween)
		return;

	this._isPlaying = false;

	for (var i = 0; i < this._movieClips.length; i++) {
		var mc = this._movieClips[i];

		mc.stop();
		mc.onComplete = null;
		this._target.removeChild(mc)
	}

	this._toState.install();

	// Call callback.
	this.complete();
}

/**
 * Get from state.
 * @method getFromState
 */
TransitionableTransition.prototype.getFromState = function() {
	return this._fromState;
}

/**
 * Get to state.
 * @method getToState
 */
TransitionableTransition.prototype.getToState = function() {
	return this._toState;
}

/**
 * Add movie clip.
 * @method addMovieClip
 */
TransitionableTransition.prototype.addMovieClip = function(mc) {
	this._movieClips.push(mc);
}

/**
 * Get or set the duration of the transition.
 * @property duration
 */
Object.defineProperty(TransitionableTransition.prototype, "duration", {
	get: function() {
		return this._duration;
	},

	set: function(value) {
		this._duration = value;
	}
});

module.exports = TransitionableTransition;