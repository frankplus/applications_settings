/**
 * Copyright (c) 2024 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type common from '@ohos.app.ability.common';
import BaseModel from '../../../../../../../../common/utils/src/main/ets/default/model/BaseModel';
import ConfigData from '../../../../../../../../common/utils/src/main/ets/default/baseUtil/ConfigData';
import LogUtil from '../../../../../../../../common/utils/src/main/ets/default/baseUtil/LogUtil';
import { GlobalContext } from '../../../../../../../../common/utils/src/main/ets/default/baseUtil/GlobalContext';
import Log from '../../../../../../../../common/utils/src/main/ets/default/baseUtil/LogDecorator';
import settings from '@ohos.settings';
import data_dataShare from '@ohos.data.dataShare';
import CatchError from '../../../../../../../../common/utils/src/main/ets/default/baseUtil/CatchError';

export interface ScreenTimeoutOption {
  valueMs: number;
  labelResId: Resource;
}

// power_manager rejects values <= MIN_DISPLAY_OFF_TIME_MS (1000ms) and falls back to default.
// A negative value means "never sleep" when const.settings.screen_never_sleep is true.
export const SCREEN_TIMEOUT_NEVER_MS = -1;
export const SCREEN_TIMEOUT_DEFAULT_MS = 60000;

export const SCREEN_TIMEOUT_OPTIONS: ScreenTimeoutOption[] = [
  { valueMs: 15000, labelResId: $r('app.string.screenTimeout15Seconds') },
  { valueMs: 30000, labelResId: $r('app.string.screenTimeout30Seconds') },
  { valueMs: 60000, labelResId: $r('app.string.screenTimeout1Minute') },
  { valueMs: 120000, labelResId: $r('app.string.screenTimeout2Minutes') },
  { valueMs: 300000, labelResId: $r('app.string.screenTimeout5Minutes') },
  { valueMs: 600000, labelResId: $r('app.string.screenTimeout10Minutes') },
  { valueMs: 1800000, labelResId: $r('app.string.screenTimeout30Minutes') },
  { valueMs: SCREEN_TIMEOUT_NEVER_MS, labelResId: $r('app.string.screenTimeoutNever') },
];

export function getScreenTimeoutLabel(timeoutMs: number): Resource {
  if (timeoutMs < 0) {
    return $r('app.string.screenTimeoutNever');
  }
  for (let option of SCREEN_TIMEOUT_OPTIONS) {
    if (option.valueMs === timeoutMs) {
      return option.labelResId;
    }
  }
  return $r('app.string.screenTimeout1Minute');
}

export class ScreenTimeoutModel extends BaseModel {
  private dataShareHelper;
  private timeoutMs: number = SCREEN_TIMEOUT_DEFAULT_MS;
  private TAG = `${ConfigData.TAG} ScreenTimeoutModel `;
  private readonly listenUri = 'datashare:///com.ohos.settingsdata/entry/settingsdata/SETTINGSDATA?Proxy=true&key='
    + ConfigData.SETTINGSDATA_SCREEN_OFF_TIMEOUT;

  constructor() {
    super();
    let context = GlobalContext.getContext().getObject(GlobalContext.globalKeySettingsAbilityContext) as common.Context;
    if (!GlobalContext.getContext().getObject(GlobalContext.globalKeySettingsAbilityContext)) {
      LogUtil.info(`${this.TAG} global context settingsAbilityContext is null`);
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
  public getValue(): number {
    return this.timeoutMs;
  }

  public isSelected(option: ScreenTimeoutOption): boolean {
    // "Never" is any negative value persisted by the system.
    if (option.valueMs === SCREEN_TIMEOUT_NEVER_MS) {
      return this.timeoutMs < 0;
    }
    return this.timeoutMs === option.valueMs;
  }

  public getCurrentLabel(): Resource {
    for (let option of SCREEN_TIMEOUT_OPTIONS) {
      if (this.isSelected(option)) {
        return option.labelResId;
      }
    }
    return $r('app.string.screenTimeout1Minute');
  }

  @Log
  @CatchError(undefined)
  public setValue(timeoutMs: number): void {
    this.timeoutMs = timeoutMs;
    AppStorage.SetOrCreate('ScreenTimeoutValue', timeoutMs);
    let context = GlobalContext.getContext().getObject(GlobalContext.globalKeySettingsAbilityContext) as common.Context;
    try {
      settings.setValueSync(context, ConfigData.SETTINGSDATA_SCREEN_OFF_TIMEOUT, timeoutMs.toString());
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
    let raw = settings.getValueSync(context, ConfigData.SETTINGSDATA_SCREEN_OFF_TIMEOUT, SCREEN_TIMEOUT_DEFAULT_MS.toString());
    let parsed = parseInt(raw);
    if (Number.isNaN(parsed)) {
      parsed = SCREEN_TIMEOUT_DEFAULT_MS;
    }
    this.timeoutMs = parsed;
    AppStorage.SetOrCreate('ScreenTimeoutValue', parsed);
    LogUtil.info(`${this.TAG} updateValue [timeoutMs:${parsed}]`);
  }
}
