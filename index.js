import React from 'react'
import {
    View,
    Image,
    Animated,
    TouchableOpacity,
    Button,
    Platform,
    ScrollView,
    Text,
    TextInput,
    Dimensions,
    Vibration
} from 'react-native'

// Styles
const Styles = {
    mainContainer: {
        flex: 1,
        marginTop: (Platform.OS === 'ios') ? 64 : 54,
    },
    container: {
        flex: 1,
        borderWidth: 0
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: 20,
        borderWidth: 0
    },
    countdown: {
        fontSize: 40
    },
    errorMessage: {
        color: 'red',
        fontSize: 18,
        textAlign: 'center',
    },
    timeInput: {
        width: Dimensions.get('window').width,
        fontSize: 150,
        textAlign: 'center',
        alignSelf: 'stretch',
        borderWidth: 0
    },
    infoText: {
        padding: 15
    },
    timesUpStyles: {
        color: '#34a53d',
        fontSize: 25,
        padding: 15
    }
};

export default class CountdownTimer extends React.Component {
    static get defaultProps() {
        return{
            invalidTimeError: 'Please set a time to begin a countdown',
            timesUpMessage: 'Times Up!',
            vibrateOnComplete: true,
            infoText: 'Some helpful info',
            startButtonTitle: 'Start',
            startButtonColor: '#25b31d',
            startButtonLabel: 'Press to start',
            pauseButtonTitle: 'Pause',
            pauseButtonColor: '#ada2a2',
            pauseButtonLabel: 'Press to pause',
            resetButtonTitle: 'Reset',
            resetButtonColor: '#ff0101',
            resetButtonLabel: 'Press to reset'
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            seconds: '',
            timer: null,
            timesUp: false,
            startButton: true,
            pauseButton: false,
            resetButton: true
        };
        this.renderCountdown = this.renderCountdown.bind(this);
        this.renderButton = this.renderButton.bind(this);
        this.start = this.start.bind(this);
        this.pause = this.pause.bind(this);
        this.reset = this.reset.bind(this);
    }

    start() {
        this.log('render countdown');
        let _this = this;
        if (this.state.seconds <= '0' || !this.state.seconds) {
            this.setState({
                errorMessage: 'Please set a time to begin a countdown'
            });
        } else {
            this.setState({
                pauseButton: true,
                timesUp: false
            }, () => {
                _this.renderCountdown();
            });
        }
    }

    pause() {
        this.log('pause');
        let _this = this;
        this.setState({
            pauseButton: false
        }, () => {
            clearInterval(_this.state.timer);
        });
    }

    reset() {
        this.log('reset');
        let _this = this;
        this.setState({
            seconds: '',
            pauseButton: false,
            timesUp: false
        }, () => {
            clearInterval(_this.state.timer);
        });

    }

    /**
     * Renders button into view if state condition is true
     * @param title
     * @param color
     * @param label
     * @param callback
     * @param state
     * @returns {*}
     */
    renderButton(title, color, label, callback, state) {
        return (
            <Button
                onPress={() => callback()}
                title={title}
                color={color}
                accessibilityLabel={label}
                disabled={!state}
            />
        )
    }

    renderCountdown() {
        this.log('render countdown');
        this.log('seconds: ' + this.state.seconds);
        let interval = 1000,
            duration = this.state.seconds * interval,
            _this = this;
        this.log('duration first: ' + duration);
        let timer = setInterval(() => {
            duration = duration - interval;
            _this.log('duration after: ' + duration);
            _this.setState({
                seconds: ''+duration / 1000+'',
                timer: timer
            });
            if (duration <= 1) {
                _this.setState({
                    seconds: '',
                    timer: null,
                    timesUp: true
                }, () => {
                    clearInterval(timer);
                });
            }
        }, interval);
    }

    timeUp() {
        if (this.props.vibrateOnComplete === true) {
            Vibration.vibrate();
            this.setState({
                timesUp: true
            })
        }
    }

    renderError() {
        let errorMessage = this.state.errorMessage;
        if (!errorMessage) {
            return null;
        }

        return (
            <View style={Styles.container}>
                <Text style={Styles.errorMessage}>
                    {errorMessage}
                </Text>
            </View>
        )
    }

    log(log) {
        if (__DEV__) {
            console.log(log);
        }
    }

    showTimesUp() {
        if (this.state.timesUp === true) {
            return (
                <View style={Styles.container}>
                    <Text style={Styles.timesUpStyles}>{this.props.timesUpMessage}</Text>
                </View>
            )
        } else {
            return null;
        }
    }

    render () {
        return (
            <View style={Styles.mainContainer}>
                <ScrollView
                    style={Styles.container}
                    keyboardDismissMode='on-drag'
                    keyboardShouldPersistTaps={true}>
                    <View style={[Styles.section, Styles.infoText]}>
                        <Text>{this.props.infoText}</Text>
                    </View>
                    {this.renderError()}
                    {this.showTimesUp()}
                    <View style={Styles.rowContainer}>
                        <TextInput
                            style={Styles.timeInput}
                            keyboardType='numeric'
                            placeholder='0'
                            maxLength={3}
                            value={this.state.seconds}
                            onChangeText={(seconds) => {
                                let errorMessage = (seconds) ? '' : this.state.errorMessage;
                                this.setState({
                                    seconds: seconds,
                                    errorMessage: errorMessage,
                                    timesUp: false
                                })
                            }}
                        />
                    </View>
                    <View style={Styles.rowContainer}>
                        {this.renderButton(
                            this.props.startButtonTitle,
                            this.props.startButtonColor,
                            this.props.startButtonLabel,
                            this.start,
                            this.state.startButton
                        )}
                        {this.renderButton(
                            this.props.pauseButtonTitle,
                            this.props.pauseButtonColor,
                            this.props.pauseButtonLabel,
                            this.pause,
                            this.state.pauseButton
                        )}
                        {this.renderButton(
                            this.props.resetButtonTitle,
                            this.props.resetButtonColor,
                            this.props.resetButtonLabel,
                            this.reset,
                            this.state.resetButton
                        )}
                    </View>
                </ScrollView>
            </View>
        )
    }
}

