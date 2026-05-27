/**
 * Copyright (c) 2026 Francesco Pham
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

import LogUtil from '../../../../../../common/utils/src/main/ets/default/baseUtil/LogUtil';
import ConfigData from '../../../../../../common/utils/src/main/ets/default/baseUtil/ConfigData';
import HeadComponent from '../../../../../../common/component/src/main/ets/default/headComponent';
import {
  SystemNavigationModel,
  NavModeOption,
  NAV_MODE_OPTIONS,
  NAV_MODE_THREE_BUTTON,
} from '../model/systemNavigationImpl/SystemNavigationModel';

@Entry
@Component
struct SystemNavigation {
  @StorageLink('SystemNavigationMode') currentMode: string = NAV_MODE_THREE_BUTTON;
  @State systemNavigationModel: SystemNavigationModel = new SystemNavigationModel();
  private TAG = ConfigData.TAG + 'SystemNavigation ';
  private options: NavModeOption[] = NAV_MODE_OPTIONS;

  build() {
    Column() {
      GridContainer({ gutter: ConfigData.GRID_CONTAINER_GUTTER_24, margin: ConfigData.GRID_CONTAINER_MARGIN_24 }) {
        Column() {
          HeadComponent({ headName: $r('app.string.systemNavigationTab'), isActive: true });

          List() {
            ForEach(this.options, (item: NavModeOption) => {
              ListItem() {
                Flex({ justifyContent: FlexAlign.SpaceBetween, alignItems: ItemAlign.Center }) {
                  Column() {
                    Text(item.labelResId)
                      .fontColor($r('sys.color.ohos_id_color_text_primary'))
                      .fontSize($r('app.float.font_16'))
                      .lineHeight($r('app.float.lineHeight_22'))
                      .fontWeight(FontWeight.Medium)
                      .textAlign(TextAlign.Start)
                      .width(ConfigData.WH_100_100);
                    Text(item.descriptionResId)
                      .fontColor($r('sys.color.ohos_id_color_text_secondary'))
                      .fontSize($r('app.float.font_14'))
                      .lineHeight($r('app.float.lineHeight_19'))
                      .textAlign(TextAlign.Start)
                      .width(ConfigData.WH_100_100)
                      .margin({ top: $r('app.float.distance_2') });
                  }
                  .layoutWeight(1)
                  .alignItems(HorizontalAlign.Start)
                  .margin({ top: $r('app.float.distance_8'), bottom: $r('app.float.distance_8') });

                  Radio({ value: this.TAG + item.value, group: 'systemNavigationGroup' })
                    .height($r('app.float.wh_value_24'))
                    .width($r('app.float.wh_value_24'))
                    .enabled(true)
                    .checked(this.systemNavigationModel.isSelected(item))
                    .margin({
                      top: $r('app.float.distance_12'),
                      bottom: $r('app.float.distance_12'),
                      right: $r('app.float.distance_12')
                    })
                    .onClick(() => this.systemNavigationModel.setValue(item.value));
                }
                .width(ConfigData.WH_100_100)
                .onClick(() => this.systemNavigationModel.setValue(item.value));
              }
            }, (item: NavModeOption) => item.value);
          }
          .padding({
            left: $r('app.float.wh_value_12'),
            right: $r('app.float.wh_value_4'),
            top: $r('app.float.distance_4'),
            bottom: $r('app.float.distance_4')
          })
          .divider({ strokeWidth: $r('app.float.divider_wh'), color: $r('app.color.color_E3E3E3_grey') })
          .borderRadius($r('app.float.radius_24'))
          .backgroundColor($r('sys.color.ohos_id_color_foreground_contrary'));
        }
        .useSizeType({
          sm: { span: 4, offset: 0 },
          md: { span: 6, offset: 1 },
          lg: { span: 8, offset: 2 }
        })
      }
      .width(ConfigData.WH_100_100)
      .height(ConfigData.WH_100_100)
    }
    .backgroundColor($r('sys.color.ohos_id_color_sub_background'))
    .width(ConfigData.WH_100_100)
    .height(ConfigData.WH_100_100)
  }

  aboutToAppear(): void {
    LogUtil.info(this.TAG + 'aboutToAppear');
    this.systemNavigationModel.registerObserver();
  }

  aboutToDisappear(): void {
    LogUtil.info(this.TAG + 'aboutToDisappear');
    this.systemNavigationModel?.unregisterObserver();
  }
}
