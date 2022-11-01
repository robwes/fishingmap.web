import React, { useState } from 'react';

function ImageCarousell({ images, cssClass }) {

	const [index, setIndex] = useState(0);
	const currentImage = images[index];

	const showNextImage = () => {
		if (index < images.length - 1) {
			setIndex(index + 1);
		} else {
			setIndex(0);
		}
	}

	const showPreviousImage = () => {
		if (index > 0) {
			setIndex(index - 1);
		} else {
			setIndex(images.length - 1);
		}
	}

	const cssClasses = "image-carousell" + (cssClass ? ` ${cssClass}` : "");

	return (
		<div className={cssClasses}>
			<img
				src={currentImage.url}
				alt={currentImage.description}
			/>
			{images.length > 1 && (
				<>
					<span className="btn-image-next" onClick={showNextImage}>
						<i className="fas fa-chevron-right"></i>
					</span>
					<span className="btn-image-previous" onClick={showPreviousImage}>
						<i className="fas fa-chevron-left"></i>
					</span>
				</>
			)}
		</div>
	);
}

export default ImageCarousell;
