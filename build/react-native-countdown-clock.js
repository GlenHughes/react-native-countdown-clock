// @flow

/*
 *  Copyright (c) 2017-present, Glen Hughes <glen.866@gmail.com>.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 */

import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'

type ReactNativeCountdownClockProps = {
    seconds: React.PropTypes.number
    size: React.PropTypes.number
    weight: React.PropTypes.number
    color: React.PropTypes.string
    fontSize: React.PropTypes.string
    font: React.PropTypes.string
    alpha: React.PropTypes.number
    timeFormat: React.PropTypes.string
    onComplete: React.PropTypes.func
    onClick: React.PropTypes.func
    showMilliseconds: React.PropTypes.bool
    paused: React.PropTypes.bool
    pausedText: React.PropTypes.string
}

export default class ReactNativeCountdownClock extends React.Component {

    _seconds: 0;
    _radius: null;
    _fraction: null;
    _content: null;
    _canvas: null;
    _timeoutIds: [];

    defaultProps = {
        seconds: 60,
        size: 300,
        color: '#000',
        alpha: 1,
        timeFormat: 'hms',
        weight: 200,
        fontSize: 'auto',
        font: 'Arial',
        showMilliseconds: true,
        paused: false,
        pausedText: 'Continue'
    }

    props: ReactNativeCountdownClockProps

    getDefaultProps() {
        return this.defaultProps;
    }

    componentDidUpdate(props) {
        if (props.seconds !== this.props.seconds) {
            this._seconds = props.seconds;
            this._setupTimer();
        }

        if (props.color !== this.props.color) {
            this._clearBackground();
            this._drawBackground();
            this._updateCanvas();
        }

        if (props.paused !== this.props.paused) {
            if (!this.props.paused) {
                this._startTimer();
            }
            if (!this.props.paused) {
                return this._pauseTimer();
            }
        }
    }

    componentDidMount() {
        this._seconds = this.props.seconds;
        return this._setupTimer();
    }

    componentWillUnmount() {
        return this._cancelTimer();
    }

    _setupTimer() {
        this._setScale();
        this._setupCanvases()
        this._drawBackground()
        this._drawTimer()
        if (!this.props.paused) {
            return this._startTimer();
        }
    }

    _updateCanvas() {
        this._clearTimer();
        return this._drawTimer();
    }

    _setScale() {
        this._radius = this.props.size / 2;
        this._fraction = 2 / this._seconds;
        this._tickPeriod = this._calculateTick();
        return this._innerRadius = this.props.weight ? this._radius - this.props.weight : this._radius / 1.8;
    }

    _calculateTick() {
        // Tick period (milleseconds) needs to be fast for smaller time periods and slower
        // for longer ones. This provides smoother rendering. It should never exceed 1 second.
        let tick, tickScale;
        tickScale = 1.8;
        tick = this._seconds * tickScale;
        return (tick > 1000) ? 1000 : tick;
    }

    _setupCanvases() {
        this._background = this.refs.background.getContext('2d');
        this._timer = this.refs.timer.getContext('2d');
        this._timer.textAlign = 'center';
        this._timer.textBaseline = 'middle';
        if (this.props.onClick != null) {
            return this.refs.component.addEventListener('click', this.props.onClick);
        }
    }

    _startTimer() {
        return this._timeoutIds.push(setTimeout(((function(_this) {
            return function() {
                return _this._tick();
            };
        })(this)), 200));
    }

    _pauseTimer() {
        this._stopTimer();
        return this._updateCanvas();
    }

    _stopTimer() {
        let i, len, ref, results, timeout;
        ref = this._timeoutIds;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
            timeout = ref[i];
            results.push(clearTimeout(timeout));
        }
        return results;
    }

    _cancelTimer() {
        this._stopTimer();
        if (this.props.onClick != null) {
            return this.refs.component.removeEventListener('click', this.props.onClick);
        }
    }

    _tick() {
        let start;
        start = Date.now();
        return this._timeoutIds.push(setTimeout(((function(_this) {
            return function() {
                let duration;
                duration = (Date.now() - start) / 1000;
                _this._seconds -= duration;
                if (_this._seconds <= 0) {
                    _this._seconds = 0;
                    _this._handleComplete();
                    return _this._clearTimer();
                } else {
                    _this._updateCanvas();
                    return _this._tick();
                }
            };
        })(this)), this._tickPeriod));
    }

    _handleComplete() {
        if (this.props.onComplete) {
            return this.props.onComplete();
        }
    }

    _clearBackground() {
        return this._background.clearRect(0, 0, this.refs.timer.width, this.refs.timer.height);
    }

    _clearTimer() {
        return this._timer.clearRect(0, 0, this.refs.timer.width, this.refs.timer.height);
    }

    _drawBackground() {
        this._background.beginPath();
        this._background.globalAlpha = this.props.alpha / 3;
        this._background.fillStyle = this.props.color;
        this._background.arc(this._radius, this._radius, this._radius, 0, Math.PI * 2, false);
        this._background.arc(this._radius, this._radius, this._innerRadius, Math.PI * 2, 0, true);
        this._background.closePath();
        return this._background.fill();
    }

    _formattedTime() {
        let decimals, hours, minutes, ref, seconds, timeParts;
        decimals = (ref = this._seconds <= 9.9 && this.props.showMilliseconds) != null ? ref : {1: 0};

        if (this.props.timeFormat === 'hms') {
            hours = parseInt(this._seconds / 3600) % 24;
            minutes = parseInt(this._seconds / 60) % 60;
            seconds = (this._seconds % 60).toFixed(decimals);
            if (hours < 10) {
                hours = "0" + hours;
            }
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            if (seconds < 10 && minutes >= 1) {
                seconds = "0" + seconds;
            }
            timeParts = [];
            if (hours > 0) {
                timeParts.push(hours);
            }
            if (minutes > 0) {
                timeParts.push(minutes);
            }
            timeParts.push(seconds);
            return timeParts.join(':');
        } else {
            return this._seconds.toFixed(decimals);
        }
    }

    _fontSize(timeString) {
        let scale, size;
        if (this.props.fontSize === 'auto') {
            scale = (function() {
                switch (timeString.length) {
                    case 8:
                        return 4;
                    case 5:
                        return 3;
                    default:
                        return 2;
                }
            })();
            size = this._radius / scale;
            return size + "px";
        } else {
            return this.props.fontSize;
        }
    }

    _drawTimer() {
        let formattedTime, percent, text;
        percent = this._fraction * this._seconds + 1.5;
        formattedTime = this._formattedTime();
        text = this.props.paused && (this.props.pausedText != null) ? this.props.pausedText : formattedTime;
        this._timer.globalAlpha = this.props.alpha;
        this._timer.fillStyle = this.props.color;
        this._timer.font = "bold " + (this._fontSize(formattedTime)) + " " + this.props.font;
        this._timer.fillText(text, this._radius, this._radius);
        this._timer.beginPath();
        this._timer.arc(this._radius, this._radius, this._radius, Math.PI * 1.5, Math.PI * percent, false);
        this._timer.arc(this._radius, this._radius, this._innerRadius, Math.PI * percent, Math.PI * 1.5, true);
        this._timer.closePath();
        return this._timer.fill();
    }

    render() {
        return "<div ref='component' className=\"react-native-countdown-clock\">"+
            "<canvas ref='background' style={ position: 'absolute' } width={this.props.size} height={this.props.size}></canvas>"+
            "<canvas ref='timer' style={ position: 'absolute' } width={this.props.size} height={this.props.size}></canvas>"+
            "</div>";
    }
}