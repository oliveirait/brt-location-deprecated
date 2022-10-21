import {  
  VStack, 
  HStack, 
  Heading, 
  IconButton, 
  Icon, 
  Center, 
  Button, 
  Box, 
  Text as NativeText } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Input } from '../components/Input';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import stations from '../data/stations';

export function Home() {

  const navigation = useNavigation()
  const data = stations
  const [searchText, setSearchText] = useState('')
  const [list, setList] = useState(data)

  function handleNextPage(start_lat: any, end_long: any, station_name: any) {
    navigation.navigate( 
      'monitoring', { start: start_lat, 
                      end: end_long, 
                      station_name: station_name } ) 
  }

  useEffect(() => {
    if (searchText === '') {
      setList(data)
    } 
    else {
      setList( 
        data.filter( 
                  function(item: any) { 
                    if (item.value.toLowerCase().indexOf( searchText.toLowerCase() ) > -1) {
                      return true
                    } 
                  } 
        ) 
      ) 
    }
  },[searchText])

  useFocusEffect(
      useCallback( () => {
        setSearchText('')
      }, [] )
  )

  return (
    <VStack flex={1} w='100%' bg='gray.800'>

      <HStack justifyContent='center'
              alignItems='center' // flex-start - TOPO // flex-end
              pt={20}
              pb={5}
              px={6}
              bg='gray.500'>

        <Heading color='amber.300' alignItems='center' fontSize={30} >
            SELECIONE A ESTAÇÃO 
        </Heading>

      </HStack>

      <HStack 
        justifyContent='space-between'
        alignItems='flex-start' // flex-start - TOPO // flex-end
        pt={8}
        pb={1}
        px={6}
        bg='gray.400'>
        
        <Input  placeholder="Insira o nome da estação"
                onChangeText={ (i) => setSearchText(i) }
                value={searchText}
                InputRightElement={ <IconButton  
                                      bg='gray.700' 
                                      icon={ <Icon  as={ <MaterialIcons name='search' /> } 
                                                    mr='2' 
                                                    pl='1' 
                                                    size={9} />  } /> } 
                
        />
      
      </HStack> 

      <VStack h='100%' w='100%' marginBottom={1} flex={1} 
        // flex-start - TOPO // flex-end
        pt={5}
        pb={2}
        px={6}
        bg='gray.400'>
      
        <FlatList
                showsVerticalScrollIndicator={false}
                data={list}
                keyExtractor={ (item) => item.value }
                renderItem={ ({item}) => 
                
                  <Box bg='gray.100' >
                    <Center  bg='gray.400' >
                        <Button  w='full' borderColor='amber.300' borderRadius={15} mb={5}
                                 onPress={ () => handleNextPage( item.start, item.end, item.value ) } variant='outline' >

                                <NativeText color='amber.400'  fontWeight='bold' fontSize={20}> 
                                  { item.value }   
                                </NativeText>
                        </Button>
                      </Center>  
                  </Box>

                 }
        />
      </VStack>

    </VStack>
  );
}
