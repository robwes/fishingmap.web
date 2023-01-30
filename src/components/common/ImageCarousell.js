import React, { useState } from 'react';
import './ImageCarousell.scss';

function ImageCarousell({ images, className }) {

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

	const getCssClasses = () => {
		return "image-carousell" + (className ? ` ${className}` : "");
	}

	return (
		<div className={getCssClasses()}>
			<img
				src={currentImage.url}
				alt={currentImage.description}
			/>
			{images.length > 1 && (
				<>
					<span className="image-carousell-next" onClick={showNextImage}>
						<i className="fas fa-chevron-right"></i>
					</span>
					<span className="image-carousell-previous" onClick={showPreviousImage}>
						<i className="fas fa-chevron-left"></i>
					</span>
				</>
			)}
		</div>
	);
}

export default ImageCarousell;
