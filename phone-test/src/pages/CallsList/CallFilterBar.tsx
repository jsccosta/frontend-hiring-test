import { Spacer, FormItem, Select } from '@aircall/tractor';
import { typeFilterOptions, directionFilterOptions } from '../options';
import { CallFilterBarProps } from './callsList.decl';

export const CallFilterBar: React.FC<CallFilterBarProps> = ({
  callTypeSelectionChange,
  callDirectionSelectionChange
}) => {
  return (
    <Spacer
      fluid
      space={3}
      direction="horizontal"
      justifyContent="stretch"
      itemsSized="evenly-sized"
    >
      <FormItem label="Call Type">
        <Select
          takeTriggerWidth={true}
          placeholder="All"
          size="regular"
          options={typeFilterOptions}
          onSelectionChange={currentSelectedKeys =>
            callTypeSelectionChange(currentSelectedKeys[0] as string)
          }
        />
      </FormItem>
      <FormItem label="Call Direction">
        <Select
          takeTriggerWidth={true}
          placeholder="All"
          size="regular"
          options={directionFilterOptions}
          onSelectionChange={currentSelectedKeys =>
            callDirectionSelectionChange(currentSelectedKeys[0] as string)
          }
        />
      </FormItem>
    </Spacer>
  );
};
