import React, { useState } from 'react';
import './ImageCarousell.scss';

function ImageCarousell({ images, className }) {

	const [index, setIndex] = useState(0);

	const showNextImage = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (index < images.length - 1) {
			setIndex(index + 1);
		} else {
			setIndex(0);
		}
	}

	const showPreviousImage = (e) => {
		e.preventDefault();
		e.stopPropagation();
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
			<div 
				className="image-carousell-track" 
				style={{ transform: `translateX(-${index * 100}%)` }}
			>
				{images.map((img, i) => (
					<div className="image-carousell-slide" key={i}>
						<img src={img.url} alt={img.description} />
					</div>
				))}
			</div>
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
