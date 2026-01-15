import React, { useContext, useState } from "react";
// import { exportComponentAsPNG } from "react-component-export-image";
import "./CoverImage.css";
import { ImgContext } from "../utils/ImgContext";
import unsplash from "../utils/unsplashConfig";
import * as htmlToImage from 'html-to-image';

const ComponentToImg = (props) => {

	const [loading, setLoading] = useState(false)
	const [copyLoading, setCopyLoading] = useState(false)

	const { unsplashImage } = useContext(ImgContext);
	const componentRef = React.createRef();




	async function saveImage(data) {
		var a = document.createElement("A");
		a.href = data;
		a.download = `cover.png`;
		document.body.appendChild(a);
		setLoading(false)

		a.click();
		document.body.removeChild(a);
	}

	const downloadImage = async () => {
		setLoading(true)
		const element = componentRef.current;

		try {
			const dataUrl = await htmlToImage.toPng(componentRef.current, {
				height: element.offsetHeight * 2,
				width: element.offsetWidth * 2,
				cacheBust: true,
				style: {
					transform: "scale(" + 2 + ")",
					transformOrigin: "top left",
					width: element.offsetWidth + "px",
					height: element.offsetHeight + "px",
				}
			});

			await saveImage(dataUrl);

			if (unsplashImage) {
				unsplash.photos.trackDownload({ downloadLocation: unsplashImage.downloadLink, });
			}
		} catch (error) {
			console.error("Download failed:", error);
			setLoading(false);
		}
	}

	const copyImageToClipboard = async () => {
		setCopyLoading(true)
		const element = componentRef.current;

		try {
			const blob = await htmlToImage.toBlob(componentRef.current, {
				height: element.offsetHeight * 2,
				width: element.offsetWidth * 2,
				cacheBust: true,
				style: {
					transform: "scale(" + 2 + ")",
					transformOrigin: "top left",
					width: element.offsetWidth + "px",
					height: element.offsetHeight + "px",
				}
			});

			await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
			alert("已复制到剪切板");
		} catch (error) {
			console.error("Copy failed: ", error);
			alert("复制失败，请重试");
		} finally {
			setCopyLoading(false);
		}
	}


	return (
		<React.Fragment>
			<div ref={componentRef}>{props.children}</div>
			<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-6 z-20 bg-white/90 backdrop-blur-sm p-2 px-6 rounded-full shadow-lg border border-gray-200 text-gray-700">
				<button
					className="flex items-center gap-2 hover:text-purple-600 transition-colors"
					onClick={() => downloadImage()}>
					<span>
						{
							loading ?
								<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"></path></svg>
								:
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
						}
					</span>

					<span className="text-sm font-medium">Download</span>
				</button>

				<div className="w-px bg-gray-300"></div>

				<button
					className="flex items-center gap-2 hover:text-purple-600 transition-colors"
					onClick={() => copyImageToClipboard()}>
					<span>
						{
							copyLoading ?
								<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"></path></svg>
								:
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
						}
					</span>

					<span className="text-sm font-medium">Copy Image</span>
				</button>
			</div>
		</React.Fragment>
	);

}

export default ComponentToImg;
