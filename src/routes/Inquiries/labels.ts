import { InquiryStatus, InquiryTopic } from '~/api/api';

export const TOPIC_LABELS: Record<InquiryTopic, string> = {
  [InquiryTopic.Session]: 'Photo session',
  [InquiryTopic.Print]: 'Print / purchase',
  [InquiryTopic.License]: 'Usage licence',
  [InquiryTopic.Collaboration]: 'Collaboration',
  [InquiryTopic.Other]: 'Other',
};

export const ALL_TOPICS = Object.keys(TOPIC_LABELS) as InquiryTopic[];

export const STATUS_LABELS: Record<InquiryStatus, string> = {
  [InquiryStatus.New]: 'New',
  [InquiryStatus.Read]: 'Read',
  [InquiryStatus.Answered]: 'Answered',
  [InquiryStatus.Archived]: 'Archived',
  [InquiryStatus.Spam]: 'Spam',
};
