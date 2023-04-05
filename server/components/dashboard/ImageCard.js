import React, { Component, Fragment } from 'react';
import { Image, Transformation } from 'cloudinary-react';
import axios from 'axios';

export default class ImageCard extends Component {
  constructor(props) {
    super(props);
    this.uploadImage = this.uploadImage.bind(this);
  }

  // Upload image to cloudinary
  async uploadImage(e) {
    const { files } = e.target;
    const data = new FormData();
    data.append('file', files[0]);
    // Append websiteImages preset
    data.append('upload_preset', 'websiteImages');

    // Delete Auth header to prevent cors error
    delete axios.defaults.headers.common['Authorization'];

    // Send the post request
    const file = await axios({
      method: 'POST',
      url: 'https://api.cloudinary.com/v1_1/jwalkercreations-com/image/upload',
      data
    });

    // Grab the image id for react components
    const imageId = file.data.public_id;

    // Update profile's state with new id
    this.props.updateProfileState('profileImageId', imageId);
  }

  render() {
    const { imageId } = this.props;

    const imageUploader = (
      <div className="image__upload">
        <Image
          cloudName="jwalkercreations-com"
          publicId={imageId}
          className="about__image__thumbnail"
        >
          <Transformation height="180" quality="auto" crop="limit" fetchFormat="auto" />
        </Image>
        <form className="image__upload__form">
          <button type="button" className="image__fake__button">
            Select Image
          </button>
          <input
            className="about__image__input"
            type="file"
            name="file"
            required
            onChange={this.uploadImage}
          />
        </form>
      </div>
    );

    return <Fragment>{imageUploader}</Fragment>;
  }
}
