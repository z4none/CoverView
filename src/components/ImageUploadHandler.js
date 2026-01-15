import React, { useContext, useRef, useImperativeHandle, forwardRef } from 'react';
import { ImgContext } from '../utils/ImgContext';

const ImageUploadHandler = forwardRef((props, ref) => {
    const { setUnsplashImage } = useContext(ImgContext);
    const inputRef = useRef();

    useImperativeHandle(ref, () => ({
        click: () => {
            if (inputRef.current) inputRef.current.click();
        }
    }));

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUnsplashImage({
                    url: event.target.result,
                    name: 'Local Upload',
                    avatar: '', // 可以放一个默认头像或留空
                    profile: '#'
                });
            };
            reader.readAsDataURL(file);
        }
        // Reset value so same file can be selected again
        e.target.value = '';
    };

    return (
        <input
            type="file"
            ref={inputRef}
            className="hidden"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept="image/*"
        />
    );
});

export default ImageUploadHandler;
