import React, { Component } from 'react';

class BioCard extends Component {
  constructor(props) {
    super(props);
    this.state = { bio: 'no data' };
    this.updateChange = this.updateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidUpdate() {
    if (this.props.bioData !== this.state.bio) {
      // Only update if bio is an empty string
      if (this.state.bio === 'no data') {
        // Set inital value
        this.setState({ bio: this.props.bioData });
      }
    }
  }

  // Update state
  updateChange(event) {
    const { value } = event.currentTarget;
    // Update state to new string value
    this.setState({ bio: value });
  }

  // Handle submit of form
  handleSubmit(event) {
    event.preventDefault();
    // Update profile component state
    this.props.updateProfileState('bio', this.state.bio);
  }

  render() {
    const { title } = this.props;
    return (
      <div className="bio__group">
        <form className="bio__form" onSubmit={this.handleSubmit}>
          <label htmlFor={title} className="group__form__label bio__form__label">
            {title}
            <textarea
              rows="5"
              cols="33"
              className="group__form__textarea"
              type="text"
              name="link"
              value={this.state.bio}
              onChange={this.updateChange}
            />
          </label>
          <input className="group__submit" type="submit" value="Update Changes" />
        </form>
      </div>
    );
  }
}

export default BioCard;
