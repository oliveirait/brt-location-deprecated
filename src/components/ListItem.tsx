import { IInputProps, Text as NativeText } from 'native-base';

export function ListItem( {data} ) {
  return (
    <NativeText color='amber.400'  fontWeight='bold' fontSize={20}> 
      {data}   
    </NativeText>
  );
}