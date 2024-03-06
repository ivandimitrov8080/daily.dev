import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ImageProps, ImageType } from '../../image/Image';
import VideoImage, { VideoImageProps } from '../../image/VideoImage';
import ConditionalWrapper from '../../ConditionalWrapper';
import { CardImage } from '../Card';
import { CardCoverShare } from './CardCoverShare';
import { CommonCardCoverProps } from '../common';
import { usePostShareLoop } from '../../../hooks/post/usePostShareLoop';

interface CardCoverProps extends CommonCardCoverProps {
  imageProps: ImageProps;
  videoProps?: Omit<VideoImageProps, 'imageProps'>;
  isVideoType?: boolean;
}

export function CardCover({
  imageProps,
  videoProps,
  isVideoType,
  onShare,
  post,
}: CardCoverProps): ReactElement {
  const { shouldShowOverlay, onInteract } = usePostShareLoop(post);
  const coverShare = (
    <CardCoverShare
      post={post}
      onShare={() => {
        onInteract();
        onShare(post);
      }}
      onCopy={onInteract}
    />
  );
  const imageClasses = classNames(
    imageProps?.className,
    shouldShowOverlay && 'opacity-16',
  );

  if (isVideoType) {
    return (
      <VideoImage
        {...videoProps}
        overlay={shouldShowOverlay ? coverShare : undefined}
        imageProps={{
          ...imageProps,
          className: imageClasses,
        }}
      />
    );
  }

  return (
    <ConditionalWrapper
      condition={shouldShowOverlay}
      wrapper={(component) => (
        <div className="relative">
          {coverShare}
          {component}
        </div>
      )}
    >
      <CardImage
        {...imageProps}
        type={ImageType.Post}
        className={imageClasses}
      />
    </ConditionalWrapper>
  );
}
