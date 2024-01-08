import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {ImageSourcePropType, LayoutChangeEvent, NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';
import {ActivityIndicator, PixelRatio, StyleSheet, View} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import Image from './Image';
import MultiGestureCanvas, {defaultZoomRange} from './MultiGestureCanvas';
import getCanvasFitScale from './MultiGestureCanvas/getCanvasFitScale';
import type {ContentSize, OnScaleChangedCallback, ZoomRange} from './MultiGestureCanvas/types';

// Increase/decrease this number to change the number of concurrent lightboxes
// The more concurrent lighboxes, the worse performance gets (especially on low-end devices)
// -1 means unlimited
// We need to define a type for this constant and therefore ignore this ESLint error, although the type is inferable,
// because otherwise TS will throw an error later in the code since "-1" and this constant have no overlap.
// We can safely ignore this error, because we might change the value in the future
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
const NUMBER_OF_CONCURRENT_LIGHTBOXES: number = 3;
const DEFAULT_IMAGE_SIZE = 200;

type LightboxImageDimensions = {
    lightboxSize?: ContentSize;
    fallbackSize?: ContentSize;
};

const cachedDimensions = new Map<ImageSourcePropType, LightboxImageDimensions>();

type ImageOnLoadEvent = NativeSyntheticEvent<ContentSize>;

type LightboxProps = {
    /** Whether source url requires authentication */
    isAuthTokenRequired: boolean;

    /** URI to full-sized attachment, SVG function, or numeric static image on native platforms */
    source: ImageSourcePropType;

    /** Triggers whenever the zoom scale changes */
    onScaleChanged: OnScaleChangedCallback;

    /** Handles errors while displaying the image */
    onError: () => void;

    /** Additional styles to add to the component */
    style: StyleProp<ViewStyle>;

    /** The index of the carousel item */
    index: number;

    /** The index of the currently active carousel item */
    activeIndex: number;

    /** Whether the Lightbox is used within a carousel component and there are other sibling elements */
    hasSiblingCarouselItems: boolean;

    /** Range of zoom that can be applied to the content by pinching or double tapping. */
    zoomRange: ZoomRange;
};

/**
 * On the native layer, we use a image library to handle zoom functionality
 */
function Lightbox({
    isAuthTokenRequired = false,
    source,
    onScaleChanged,
    onError,
    style,
    index = 0,
    activeIndex = 0,
    hasSiblingCarouselItems = false,
    zoomRange = defaultZoomRange,
}: LightboxProps) {
    const StyleUtils = useStyleUtils();

    const [containerSize, setContainerSize] = useState({width: 0, height: 0});
    const isContainerLoaded = containerSize.width !== 0 && containerSize.height !== 0;

    const [imageDimensions, setInternalImageDimensions] = useState(() => cachedDimensions.get(source));
    const setImageDimensions = useCallback(
        (newDimensions: LightboxImageDimensions) => {
            setInternalImageDimensions(newDimensions);
            cachedDimensions.set(source, newDimensions);
        },
        [source],
    );
    const isItemActive = index === activeIndex;
    const [isActive, setActive] = useState(isItemActive);
    const [isImageLoaded, setImageLoaded] = useState(false);

    const isInactiveCarouselItem = hasSiblingCarouselItems && !isActive;
    const [isFallbackVisible, setFallbackVisible] = useState(isInactiveCarouselItem);
    const [isFallbackLoaded, setFallbackLoaded] = useState(false);

    const isLightboxLoaded = imageDimensions?.lightboxSize != null;
    const isLightboxInRange = useMemo(() => {
        if (NUMBER_OF_CONCURRENT_LIGHTBOXES === -1) {
            return true;
        }

        const indexCanvasOffset = Math.floor((NUMBER_OF_CONCURRENT_LIGHTBOXES - 1) / 2) || 0;
        const indexOutOfRange = index > activeIndex + indexCanvasOffset || index < activeIndex - indexCanvasOffset;
        return !indexOutOfRange;
    }, [activeIndex, index]);
    const isLightboxVisible = isLightboxInRange && (isActive || isLightboxLoaded || isFallbackLoaded);

    // If the fallback image is currently visible, we want to hide the Lightbox until the fallback gets hidden,
    // so that we don't see two overlapping images at the same time.
    // If there the Lightbox is not used within a carousel, we don't need to hide the Lightbox,
    // because it's only going to be rendered after the fallback image is hidden.
    const shouldHideLightbox = hasSiblingCarouselItems && isFallbackVisible;

    const isLoading = isActive && (!isContainerLoaded || !isImageLoaded);

    const updateCanvasSize = useCallback(
        ({
            nativeEvent: {
                layout: {width, height},
            },
        }: LayoutChangeEvent) => setContainerSize({width: PixelRatio.roundToNearestPixel(width), height: PixelRatio.roundToNearestPixel(height)}),
        [],
    );

    // We delay setting a page to active state by a (few) millisecond(s),
    // to prevent the image transformer from flashing while still rendering
    // Instead, we show the fallback image while the image transformer is loading the image
    useEffect(() => {
        if (isItemActive) {
            setTimeout(() => setActive(true), 1);
        } else {
            setActive(false);
        }
    }, [isItemActive]);

    useEffect(() => {
        if (isLightboxVisible) {
            return;
        }
        setImageLoaded(false);
    }, [isLightboxVisible, setImageDimensions]);

    useEffect(() => {
        if (!hasSiblingCarouselItems) {
            return;
        }

        if (isActive) {
            if (isImageLoaded && isFallbackVisible) {
                // We delay hiding the fallback image while image transformer is still rendering
                setTimeout(() => {
                    setFallbackVisible(false);
                    setFallbackLoaded(false);
                }, 100);
            }
        } else {
            if (isLightboxVisible && isLightboxLoaded) {
                return;
            }

            // Show fallback when the image goes out of focus or when the image is loading
            setFallbackVisible(true);
        }
    }, [hasSiblingCarouselItems, isActive, isFallbackVisible, isLightboxLoaded, isLightboxVisible, isImageLoaded]);

    const fallbackSize = useMemo(() => {
        if (!hasSiblingCarouselItems || (imageDimensions?.lightboxSize == null && imageDimensions?.fallbackSize == null) || containerSize.width === 0 || containerSize.height === 0) {
            return {
                width: DEFAULT_IMAGE_SIZE,
                height: DEFAULT_IMAGE_SIZE,
            };
        }

        // If the lightbox size is undefined, th fallback size cannot be undefined,
        // because we already checked for that before and would have returned early.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const imageSize = imageDimensions.lightboxSize ?? imageDimensions.fallbackSize!;

        const {minScale} = getCanvasFitScale({canvasSize: containerSize, contentSize: imageSize});

        return {
            width: PixelRatio.roundToNearestPixel(imageSize.width * minScale),
            height: PixelRatio.roundToNearestPixel(imageSize.height * minScale),
        };
    }, [containerSize, hasSiblingCarouselItems, imageDimensions]);

    return (
        <View
            style={[StyleSheet.absoluteFill, style]}
            onLayout={updateCanvasSize}
        >
            {isContainerLoaded && (
                <>
                    {isLightboxVisible && (
                        <View style={[...StyleUtils.getFullscreenCenteredContentStyles(), StyleUtils.getLightboxVisibilityStyle(shouldHideLightbox)]}>
                            <MultiGestureCanvas
                                isActive={isActive}
                                onScaleChanged={onScaleChanged}
                                canvasSize={containerSize}
                                contentSize={imageDimensions?.lightboxSize}
                                zoomRange={zoomRange}
                            >
                                <Image
                                    isActive={isActive}
                                    source={{uri: source}}
                                    style={imageDimensions ?? {width: DEFAULT_IMAGE_SIZE, height: DEFAULT_IMAGE_SIZE}}
                                    isAuthTokenRequired={isAuthTokenRequired}
                                    onError={onError}
                                    onLoadEnd={() => setImageLoaded(true)}
                                    onLoad={(e: ImageOnLoadEvent) => {
                                        const width = (e.nativeEvent?.width || 0) * PixelRatio.get();
                                        const height = (e.nativeEvent?.height || 0) * PixelRatio.get();
                                        setImageDimensions({...imageDimensions, lightboxSize: {width, height}});
                                    }}
                                />
                            </MultiGestureCanvas>
                        </View>
                    )}

                    {/* Keep rendering the image without gestures as fallback if the carousel item is not active and while the lightbox is loading the image */}
                    {isFallbackVisible && (
                        <View style={StyleUtils.getFullscreenCenteredContentStyles()}>
                            <Image
                                source={{uri: source}}
                                resizeMode="contain"
                                style={fallbackSize}
                                isAuthTokenRequired={isAuthTokenRequired}
                                onLoadEnd={() => setFallbackLoaded(true)}
                                onLoad={(e: ImageOnLoadEvent) => {
                                    const width = (e.nativeEvent?.width || 0) * PixelRatio.get();
                                    const height = (e.nativeEvent?.height || 0) * PixelRatio.get();

                                    if (imageDimensions?.lightboxSize != null) {
                                        return;
                                    }

                                    setImageDimensions({...imageDimensions, fallbackSize: {width, height}});
                                }}
                            />
                        </View>
                    )}

                    {/* Show activity indicator while the lightbox is still loading the image. */}
                    {isLoading && (
                        <ActivityIndicator
                            size="large"
                            style={StyleSheet.absoluteFill}
                        />
                    )}
                </>
            )}
        </View>
    );
}

Lightbox.displayName = 'Lightbox';

export default Lightbox;
