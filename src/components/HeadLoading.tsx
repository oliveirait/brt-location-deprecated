import {  VStack, Heading, Badge } from 'native-base';

export function HeadLoading() {
  return (
    <VStack justifyContent="center" alignItems='center' pt={20}>
        <Heading textAlign='center' color='blue.400' fontSize={25} fontWeight='normal'> 
              Sem novos itens...
        </Heading>
    </VStack>
  );
}


