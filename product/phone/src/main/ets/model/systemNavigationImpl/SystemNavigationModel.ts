/**
 * Copyright (c) 2026 Francesco Pham
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import type common from '@ohos.app.ability.common';
import BaseModel from '../../../../../../../common/utils/src/main/ets/default/model/BaseModel';
import ConfigData from '../../../../../../../common/utils/src/main/ets/default/baseUtil/ConfigData';
import LogUtil from '../../../../../../../common/utils/src/main/ets/default/baseUtil/LogUtil';
import { GlobalContext } from '../../../../../../../common/utils/src/main/ets/default/baseUtil/GlobalContext';
import Log from '../../../../../../../common/utils/src/main/ets/default/baseUtil/LogDecorator';
import settings from '@ohos.settings';
import data_dataShare from '@ohos.data.dataShare';
import CatchError from '../../../../../../../common/utils/src/main/ets/default/baseUtil/CatchError';

// Re-uses the existing systemui key. '1' = 3-button bar shown (legacy default),
// '0' = bar hidden so OniroBottomGesture takes over input. systemui's
// NavigationBarViewModel already toggles its window based on this exact value.
export const NAV_MODE_KEY = 'settings.display.navigationbar_status';
export const NAV_MODE_THREE_BUTTON = '1';
export const NAV_MODE_GESTURE = '0';

export interface NavModeOption {
  value: string;
  labelResId: Resource;
  descriptionResId: Resource;
}

export const NAV_MODE_OPTIONS: NavModeOption[] = [
  {
    value: NAV_MODE_GESTURE,
    labelResId: $r('app.string.systemNavigationGesture'),
    descriptionResId: $r('app.string.systemNavigationGestureDescription'),
  },
  {
    value: NAV_MODE_THREE_BUTTON,
    labelResId: $r('app.string.systemNavigationThreeButton'),
    descriptionResId: $r('app.string.systemNavigationThreeButtonDescription'),
  },
];

export class SystemNavigationModel extends BaseModel {
  private dataShareHelper;
  private mode: string = NAV_MODE_THREE_BUTTON;
  private TAG = `${ConfigData.TAG} SystemNavigationModel `;
  private readonly listenUri =
    'datashare:///com.ohos.settingsdata/entry/settingsdata/SETTINGSDATA?Proxy=true&key=' + NAV_MODE_KEY;

  constructor() {
    super();
    let context = GlobalContext.getContext().getObject(GlobalContext.globalKeySettingsAbilityContext) as common.Context;
    if (!context) {
      LogUtil.info(`${this.TAG} settingsAbilityContext is null`);
      return;
    }
    data_dataShare.createDataShareHelper(context, this.listenUri)
      .then((dataHelper) => {
        this.dataShareHelper = dataHelper;
        this.dataShareHelper.on('dataChange', this.listenUri, () => {
          this.updateValue();
        });
      });
    this.updateValue();
  }

  @Log
  public getValue(): string {
    return this.mode;
  }

  public isSelected(option: NavModeOption): boolean {
    return this.mode === option.value;
  }

  @Log
  @CatchError(undefined)
  public setValue(mode: string): void {
    this.mode = mode;
    AppStorage.SetOrCreate('SystemNavigationMode', mode);
    let context = GlobalContext.getContext().getObject(GlobalContext.globalKeySettingsAbilityContext) as common.Context;
    try {
      settings.setValueSync(context, NAV_MODE_KEY, mode);
    } catch (err) {
      LogUtil.error(`${this.TAG} setValue failed`);
    }
  }

  @Log
  public registerObserver(): void {
  }

  @Log
  public unregisterObserver(): void {
    this.dataShareHelper?.off('dataChange', this.listenUri);
  }

  @Log
  @CatchError(undefined)
  private updateValue(): void {
    let context = GlobalContext.getContext().getObject(GlobalContext.globalKeySettingsAbilityContext) as common.Context;
    let raw = settings.getValueSync(context, NAV_MODE_KEY, NAV_MODE_THREE_BUTTON);
    if (raw !== NAV_MODE_GESTURE && raw !== NAV_MODE_THREE_BUTTON) {
      raw = NAV_MODE_THREE_BUTTON;
    }
    this.mode = raw;
    AppStorage.SetOrCreate('SystemNavigationMode', raw);
    LogUtil.info(`${this.TAG} updateValue [mode:${raw}]`);
  }
}
