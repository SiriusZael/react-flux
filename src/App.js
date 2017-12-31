import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Dispatcher } from 'flux';
import { EventEmitter } from 'fbemitter';

const myDispatcher = new Dispatcher();

class Store {
  constructor() {
    this._store = {};
    this._emitter = new EventEmitter();

    this._dispatchToken = myDispatcher.register(this._handleDispatchedAction.bind(this));
  }

  _handleDispatchedAction() {
    this.update();
  }

  addListener(callback) {
    this._emitter.addListener('change', callback);
  }

  // TODO remove listeners

  update(payload) {
    this._store = payload;
    this._emitter.emit('change');
  }

  get() {
    return this._store;
  }
}

class AppStore extends Store {
  _handleDispatchedAction(payload) {
    switch (payload.actionType) {
      case 'click-button':
        this.update(payload.data);
    }
  }
}

const actions = {
  clickButtonAction: (data) => {
    myDispatcher.dispatch({
      actionType: 'click-button',
      data,
    });
  },
};

function Button(props) {
  const handleClick = () => {
    actions.clickButtonAction(props.children);
  };

  return (
    <button onClick={handleClick}>
      {props.children}
    </button>
  );
}

function ButtonList() {
  const Buttons = ['Click', 'Flick', 'Shtick'];

  return Buttons.map((buttonName) => (
    <Button key={buttonName}>
      {buttonName}
    </Button>
  ));
}

function addStoreListener(SubscriberComponent, store, callback) {
  class Wrapper extends Component {
    constructor() {
      super();

      this._handleStoreChange = this._handleStoreChange.bind(this);
    }

    componentWillMount() {
      store.addListener(this._handleStoreChange);
    }

    // TODO remove listeners

    _handleStoreChange() {
      this.setState(callback(this.props, store));
    }

    render() {
      return <SubscriberComponent {...this.props} {...this.state} />
    }
  }

  return Wrapper;
}

class App extends Component {
  render() {
    console.log(this.props);

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <ButtonList />
      </div>
    );
  }
}

export default addStoreListener(App, new AppStore(), (props, store) => {
  return {
    data: store.get(),
  };
});
