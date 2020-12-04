import React, { Component } from 'react'
import { Icon, Menu, Modal, Form, Input, Button } from 'semantic-ui-react'
import { connect } from 'react-redux';
import firebase from '../../Firebase';

export default class Channels extends Component {
    state = {
        user: this.props.currentUser,
        channels: [],
        channelName: '',
        channelDetails: '',
        channelsRef: firebase.database().ref('channels'),
        modal: false
    }

    componentDidMount() {
        this.addListeners();
    }

    addListeners = () => {
        let loadedChannels = [];
        this.state.channelsRef.on('child_added', snap => {
            loadedChannels.push(snap.val());
            this.setState({ channels: loadedChannels });
        })
    }

    addChannel = () => {
        const { channelsRef, channelName, channelDetails, user } = this.state;

        const key = channelsRef.push().key;

        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName, 
                avatar: user.photoURL
            }
        };

        channelsRef
            .child(key)
            .update(newChannel)
            .then(() => {
                this.setState({ channelName: '', channelDetails: ''});
                this.closeModal();
                console.log('channel added');
            })
            .catch(err => {
                console.error(err)
            })
    }

    handleSubmit = event => {
        event.preventDefault();
        if (this.isFormValid(this.state)) {
            this.addChannel();
        }
    }

    handleChange = event => {
        this.setState ({[event.target.name]: event.target.value })

    };

    changeChannel = channel => {
        this.props.setCurrentChannel(channel);
    }

    displayChannels = channels => 
        channels.length > 0 && 
        channels.map(channel => (
            <Menu.Item
            
            key={channel.id}
            onClick={() =>  this.changeChannel(channel)}
            name = {channel.name}
            style= {{ opacity: 0.7 }}
            >

             # {channel.name}  

            </Menu.Item>

        ));

    isFormValid = ({ channelName, channelDetails }) => channelName && channelDetails;

    openModal = () => this.setState({ modal: true});

    closeModal = () => this.setState({ modal: false});
    

    render() {
        const { channels, modal } = this.state;

        return (
            <React.Fragment>
            <Menu.Menu style={{ paddingBottom: '2em' }}>
                <Menu.Item>
                    <span>
                        <Icon name="exchange"/> CHANNELS
                    </span>{ " " }
                    ({ channels.length }) <Icon name="add" onClick={this.openModal}/>
                </Menu.Item>
                {this.displayChannels(channels)}
            </Menu.Menu>
            
                {/* Add Channel */}
                <Modal basic open={modal} onClose = { this.closeModal } className = "modal">
                    <Modal.Header>Add a Channel</Modal.Header>
                    <Modal.Content>
                        <Form on Submit={this.handleSubmit}>
                            <Form.Field>
                                <Input
                                fluid
                                label="Name of Channel"
                                name="channelName"
                                onChange={this.handleChange}
                                />
                                
                            </Form.Field>

                            <Form.Field>
                                <Input
                                fluid
                                label="About Channel"
                                name="channelDetails"
                                onChange={this.handleChange}
                                />
                                
                            </Form.Field>
                        </Form>
                    </Modal.Content>

                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSubmit}>
                            <Icon name="checkmark" /> Add
                        </Button>
                        <Button color="red" inverted onClick = {this.closeModal}>
                            <Icon name="remove" /> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
        )
    }
}
