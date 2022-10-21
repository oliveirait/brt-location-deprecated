import {  HStack, Heading } from 'native-base';

export function HeadLoading(  ) {
  return (
    <HStack space={2} justifyContent="center">
      <Heading textAlign='center' color='blue.400' fontSize={30}> Procurando veículos... </Heading>
    </HStack>
  );
}
