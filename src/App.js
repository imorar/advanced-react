import React, { Component } from 'react';
import Filters from './Filters';
import PuppyAddForm from './PuppyAddForm';
import PuppiesList from './PuppiesList';
import { determineFilteredPuppies } from './Utils';
import * as actions from './Puppy.actions';
import { connect } from 'react-redux';
import './App.css';

class App extends Component {
  constructor() {
    super();

    this.state = {
      isInAddMode: false
    };
  }

  componentDidMount = () => this.props._getPuppies();

  _onChangeFilterHandler = e => {
    const newFilter = e.target.value;
    let filteredPuppies = determineFilteredPuppies(
      this.state.puppies,
      newFilter
    );

    this.setState(() => ({
      filteredPuppies,
      currentFilter: newFilter
    }));
  };

  _onClickAddHandler = () =>
    this.setState(prevState => ({
      ...prevState,
      isInAddMode: !prevState.isInAddMode
    }));

  _onClickSaveHandler = puppy => {
    fetch(`/puppies`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(puppy)
    })
      .then(() => fetch(`/puppies`))
      .then(res => res.json())
      .then(res =>
        this.setState(() => ({
          puppies: res.slice(0),
          filteredPuppies: res.slice(0),
          isInAddMode: false
        }))
      );
  };

  _onClickAdoptHandler = puppyId => {
    const puppy = this.state.puppies.find(puppy => puppy.id === puppyId);
    puppy.adopted = !puppy.adopted;

    fetch(`/puppies/${puppyId}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(puppy)
    })
      .then(() => fetch(`/puppies`))
      .then(res => res.json())
      .then(res =>
        this.setState(() => ({
          puppies: res.slice(0),
          filteredPuppies: determineFilteredPuppies(
            res.slice(0),
            this.state.currentFilter
          )
        }))
      );
  };

  _onClickDeleteHandler = puppyId => {
    fetch(`/puppies/${puppyId}`, { method: 'DELETE' })
      .then(() => fetch(`/puppies`))
      .then(res => res.json())
      .then(res =>
        this.setState(() => ({
          puppies: res.slice(0),
          filteredPuppies: res.slice(0)
        }))
      );
  };

  render() {
    const { globalState } = this.props;
    const { puppies } = globalState;
    const { filteredPuppies } = globalState;
    const { filter } = globalState;

    if (!puppies.length) {
      return null;
    }

    return (
      <div className="puppies-app u-pa-double">
        <header className="puppies-app__header u-fx u-fx-align-center u-fx-justify-center u-mb-double">
          <h2>Puppy Adoption FTW</h2>
        </header>
        <div className="u-fx u-fx-align-center u-fx-justify-center  u-mb-double">
          <Filters
            filter={filter}
            onChangeFilterHandler={this._onChangeFilterHandler}
          />
          <span className="u-mh-double">OR</span>
          <button
            className="puppy-add-btn u-pa-half"
            onClick={this._onClickAddHandler}
          >
            Toggle add puppy form
          </button>
        </div>
        {this.state.isInAddMode ? (
          <PuppyAddForm onClickSaveHandler={this._onClickSaveHandler} />
        ) : null}
        <PuppiesList
          onClickAdoptHandler={this._onClickAdoptHandler}
          onClickDeleteHandler={this._onClickDeleteHandler}
          puppies={filteredPuppies}
        />
      </div>
    );
  }
}

const mapStateToProps = state => state;

const mapDispatchToProps = (dispatch, props) => ({
  _getPuppies: () => dispatch(actions.getPuppies())
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
