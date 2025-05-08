class MultiImageCropper {

    static imagesArray = [];
    static currentImageIndex = -1;

    constructor(imageObject) {
        this.Cropper = window.Cropper;
        this.URL = window.URL || window.webkitURL;

        MultiImageCropper.imagesArray = [];
        MultiImageCropper.currentImageIndex = -1;

        var options = {

            checkCrossOrigin: false,
            autoCrop: true,
            viewMode: 1,
            ready: function (e) {
                if (MultiImageCropper.currentImageIndex > -1) {
                    e.target.cropper.setData(MultiImageCropper.imagesArray[MultiImageCropper.currentImageIndex].crop);
                }
            },
            cropstart: function (e) { },
            cropmove: function (e) { },
            cropend: function (e) { },
            crop: function (e) {

                if (MultiImageCropper.currentImageIndex > -1) {

                    MultiImageCropper.imagesArray[MultiImageCropper.currentImageIndex].crop = e.detail;

                    document.getElementById('inputStartX').value = Math.round(e.detail.x);
                    document.getElementById('inputStartY').value = Math.round(e.detail.y);
                    document.getElementById('inputEndX').value = Math.round(e.detail.x + e.detail.width);
                    document.getElementById('inputEndY').value = Math.round(e.detail.y + e.detail.height);
                }
            },

            zoom: function (e) { },
        }

        this.cropper = new Cropper(imageObject, options);

    }

    AddImage = function (image) {
        MultiImageCropper.imagesArray.push({
            image: image,
            name: image.name,
            croppedImage: NaN,
            crop: {
                x: 0.0,
                y: 0.0,
                width: 0.0,
                height: 0.0,
                rotate: 0.0,
                scaleX: 1.0,
                scaleY: 1.0
            }
        });
    }

    SetData = function (data) {
        this.cropper.setData(data);
    }

    RebuildCropperWithoutAutoCrop = function () {
        const imageElement = this.cropper.element;
        const currentImageIndex = MultiImageCropper.currentImageIndex;
        const cropData = currentImageIndex > -1 ? MultiImageCropper.imagesArray[currentImageIndex].crop : null;

        this.cropper.destroy();
        this.cropper = new Cropper(imageElement, {
            checkCrossOrigin: false,
            autoCrop: false,
            viewMode: 1,
            ready: function (e) {
                if (cropData) {
                    e.target.cropper.setData(cropData);
                }
            },
            crop: function (e) {
                if (MultiImageCropper.currentImageIndex > -1) {
                    MultiImageCropper.imagesArray[MultiImageCropper.currentImageIndex].crop = e.detail;
                    document.getElementById('inputStartX').value = Math.round(e.detail.x);
                    document.getElementById('inputStartY').value = Math.round(e.detail.y);
                    document.getElementById('inputEndX').value = Math.round(e.detail.x + e.detail.width);
                    document.getElementById('inputEndY').value = Math.round(e.detail.y + e.detail.height);
                }
            }
        });
    }

    SelectImage = function (imageIndex) {
        const previousIndex = MultiImageCropper.currentImageIndex;
        MultiImageCropper.currentImageIndex = imageIndex;

        if (previousIndex !== -1) {

            MultiImageCropper.imagesArray[previousIndex].crop = this.cropper.getData();
            this.cropper.getCroppedCanvas().toBlob((blob) => {
                MultiImageCropper.imagesArray[previousIndex].croppedImage = blob;
            });
        }

        const selectedImage = MultiImageCropper.imagesArray[imageIndex];
        const cropData = selectedImage.crop;

        const url = this.URL.createObjectURL(selectedImage.image);
        const imageElement = this.cropper.element;

        this.cropper.destroy();
        this.cropper = new Cropper(imageElement, {
            checkCrossOrigin: false,
            autoCrop: true,
            viewMode: 1,
            ready: () => {
                this.cropper.setData(cropData);

                document.getElementById('inputStartX').value = Math.round(cropData.x);
                document.getElementById('inputStartY').value = Math.round(cropData.y);
                document.getElementById('inputEndX').value = Math.round(cropData.x + cropData.width);
                document.getElementById('inputEndY').value = Math.round(cropData.y + cropData.height);
            },
            crop: (e) => {
                if (MultiImageCropper.currentImageIndex > -1) {
                    MultiImageCropper.imagesArray[MultiImageCropper.currentImageIndex].crop = e.detail;
                    document.getElementById('inputStartX').value = Math.round(e.detail.x);
                    document.getElementById('inputStartY').value = Math.round(e.detail.y);
                    document.getElementById('inputEndX').value = Math.round(e.detail.x + e.detail.width);
                    document.getElementById('inputEndY').value = Math.round(e.detail.y + e.detail.height);
                }
            }
        });

        this.cropper.replace(url, false);
    }

    DownloadImages = function () {
        var zip = new JSZip();
        var hasCroppedImages = false;

        MultiImageCropper.imagesArray.forEach(element => {
            if (element.croppedImage instanceof Blob) {
                hasCroppedImages = true;
                zip.file(element.name, element.croppedImage);
            }
        });

        if (hasCroppedImages) {
            zip.generateAsync({ type: "blob" })
                .then(function (content) {
                    var downloadLink = document.createElement('a');
                    downloadLink.href = URL.createObjectURL(content);
                    downloadLink.download = 'CroppedImages.zip';

                    document.body.appendChild(downloadLink);
                    downloadLink.click();

                    document.body.removeChild(downloadLink);
                });
        }

        else {
            alert("No cropped images to download.");
        }
    }

}