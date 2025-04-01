import { DialogProps } from '@material-ui/core';

export interface MultiStepModalStep {
  Title: string;
  Content: React.ReactNode | ((props: { contentHeight: number }) => React.ReactNode);
  Actions: React.ReactNode;
  errorMessage?: string;
  config?: { limitedWidth?: boolean; noYScroll?: boolean; noPadding?: boolean };
}

type BaseMultiStepModalProps = {
  MainTitle: string;
  steps: MultiStepModalStep[];
  open: boolean;
  onClose: () => void;
  setActiveStepIdx: (idx: number) => void;
  activeStepIdx: number;
  disableNextSteps?: boolean;
} & Partial<DialogProps>;

export type MultiStepModalProps = BaseMultiStepModalProps;

export type MultiStepModalVariationProps = BaseMultiStepModalProps & {
  activeStep: MultiStepModalStep;
};
