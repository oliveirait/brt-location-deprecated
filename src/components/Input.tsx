import { Input as NativeBaseInput, IInputProps } from 'native-base';

export function Input( {...rest} : IInputProps ) {
    return(
        <NativeBaseInput
            w='full'
            bg='gray.700'
            h={14}
            size='2xl'
            borderWidth={0}
            fontFamily='body'
            color='white'
            placeholderTextColor='gray.300'
            placeholder='Nome da estação'
            _focus={{
                borderWidth: 1,
                borderColor: 'amber.500',
                backgroundColor: 'gray.700',
            }}
            {...rest}>

        </NativeBaseInput>
  );
}
