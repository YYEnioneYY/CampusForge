export type MinioObjectCreatedEvent = {
  EventName?: string;

  Records?: Array<{
    eventName: string;
    eventTime: string;

    s3: {
      bucket: {
        name: string;
      };

      object: {
        key: string;
        size: number;
        contentType?: string;
      };
    };
  }>;
};