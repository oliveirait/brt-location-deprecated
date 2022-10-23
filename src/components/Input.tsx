import { Input as NativeBaseInput, IInputProps } from 'native-base';

export function Input( {...rest} : IInputProps ) {
    return(
        <NativeBaseInput
            w='full'
            bg='gray.700'
            h={14}
            size='2xl'
            borderWidth={1}
            fontFamily='body'
            color='white'
            placeholderTextColor='gray.300'
            placeholder='Nome da estação'
            borderColor='amber.500'
            _focus={{
                borderWidth: 2,
                borderColor: 'blue.400',
                backgroundColor: 'white',
                color: 'black'

            }}
            {...rest}>

        </NativeBaseInput>
  );
}
