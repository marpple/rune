import { CustomEventWithDetail } from './CustomEventWithDetail';
import type { View } from './View';

export class ViewRendered extends CustomEventWithDetail<View> {}
export class ViewMounted extends CustomEventWithDetail<View> {}
export class ViewUnmounted extends CustomEventWithDetail<View> {
  isPermanent?: boolean;
}
