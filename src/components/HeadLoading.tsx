import {  VStack, Heading } from 'native-base';

export function HeadLoading() {
  return (
    <VStack justifyContent="center" alignItems='center' pt={5}>
        <Heading textAlign='center' color='blue.400' fontSize={20} fontWeight='normal'> 
          Não há itens para exibir 
        </Heading>
    </VStack>
  );
}
