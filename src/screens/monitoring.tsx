import React, { useEffect, useState, useCallback } from 'react';
import { VStack, HStack, Heading, Box, Button, Divider, Center, Text as NativeText  } from 'native-base';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import uuid from 'react-native-uuid';
import { FlatList } from 'react-native';
import { Loading } from '../components/Loading';
import { Toast } from 'react-native-toast-message/lib/src/Toast';


export function Monitoring( {route} ) {

    const navigation = useNavigation()
    const [len_list, setLenList] = useState(0)
    const [list, setList] = useState('')
    const pos_estacao = `${route.params?.start},${route.params?.end}`
    const station_name = route.params?.station_name
    var lista = []

    function handleGoBack() {
      navigation.goBack()
    }

    async function update_list() {

      let baseUrl = 'https://jeap.rio.rj.gov.br/dadosAbertosAPI/v2/transporte/veiculos/brt'

      var dados_brt = await axios.get(baseUrl)
        .then((response) => {
          return response.data
        })

      for (var i=0; i < dados_brt.length; i++) {
        dados_brt[i]['distancia_para_estacao'] = distance(dados_brt[i]['latitude'],dados_brt[i]['longitude'])
        }

      for (var i=0; i < dados_brt.length; i++) {
        if (parseFloat(dados_brt[i]['distancia_para_estacao']) <= 2) {
          dados_brt[i]['id'] = String(uuid.v4())
          dados_brt[i]['pos_estacao'] = `${pos_estacao}`
          dados_brt[i]['pos_onibus'] = `${dados_brt[i]['latitude']},${dados_brt[i]['longitude']}`
          var dados_google = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${dados_brt[i]['pos_onibus']}&destination=${dados_brt[i]['pos_estacao']}&key=AIzaSyBLSCj-HzdlrCOLcBdi_N27PB72N8P87VQ`)
            .then(resp => {
              let dist = resp.data
              return dist
            })
          dados_brt[i]['tempo'] = dados_google["routes"][0]["legs"][0]["duration"]["text"]
          dados_brt[i]['distancia'] = dados_google["routes"][0]["legs"][0]["distance"]["text"]
          lista.push(dados_brt[i])
      }
      setLenList(lista.length)
      setList(lista)
    }

    function distance(lat2: any, long2: any) {
      var distance = require('geo-dist-calc');
      var sourcePoints = { latitude: parseFloat(route.params?.start), longitude: parseFloat(route.params?.end) };
      var destinationPoints = { latitude: parseFloat(lat2), longitude: parseFloat(long2) };
      var ResultantDistance = distance.discal(sourcePoints,destinationPoints);
      return ResultantDistance['kilometers']
    }
  }

    useEffect(() => {
      update_list()
    }, [])

    async function hour() {
        setInterval(() => {
            //setRelogio(new Date().toLocaleTimeString())
        }, 1000)
    }

  return(

    <VStack flex={1} w='100%' bg='white'  >

        <HStack justifyContent='center'alignItems='center' bg='white'>
            <Box px="4" pt="4" >
                <Heading textAlign='center' color='blue.700' fontSize={40} fontWeight='bold'>

                </Heading>
            </Box>
        </HStack>

        <HStack justifyContent='center' alignItems='flex-start' pt={5} pb={4} px={6} bg='gray.500'>
          <VStack>
            <Heading textAlign='center' color='gray.100' fontSize={40} >
                { station_name }
            </Heading>
          </VStack>
        </HStack>

        <HStack justifyContent='center' alignItems='flex-start' mt={4} bg='white'>

        </HStack>

        <HStack justifyContent='space-between' alignItems='center' pt={1} pb={1} px={10} bg='white'>
          <Heading textAlign='center' color='black' fontSize={20} >
           VEÍCULOS PRÓXIMOS
          </Heading>

          <Heading textAlign='center' color='blue.500' fontSize={20} >
            { len_list != 0 ? len_list : <Loading /> }
          </Heading>
        </HStack>

      <HStack justifyContent='center' alignItems='center' pt={1} pb={1} bg='white'>
        <VStack flex={1} divider={<Divider />} justifyContent='center' alignItems='center' px={6} bg='white'>
          <Box px="1" >
            <Heading  textAlign={'center'} color='blue.700' fontSize={10} >
               {/* Em { Math.round(estimativa) } minutos */}
            </Heading>
          </Box>
        </VStack>
      </HStack>


    <VStack h='100%' w='100%' mb={1} pt={5} flex={1}  bg='gray.400'>

     <FlatList
        showsVerticalScrollIndicator={true}
        data={list}
        ListEmptyComponent={ <Loading /> }
        keyExtractor={ (item) => String(item.id) }
        renderItem={ ({item}) =>

        <Button size="sm" variant="outline" colorScheme="secondary">
          <Center h={110} bg='gray.400' w='full' >
           <VStack flex={1} divider={<Divider color='white'/>} justifyContent='center' alignItems='center' px={1} >
             <NativeText  color='amber.400'  textAlign='center' fontWeight='bold' fontSize={10}   >
                 <Heading textAlign='center' color='amber.400' fontSize={18} >
                   
                  {item['linha']} { item['nomeLinha'] } {'\n'}
                   Velocidade { item['velocidade'] } km/h {'  |  '} Distância  { item['distancia'] } {'\n'}
                   Estimativa de chegada { item['tempo'] }

                 </Heading>
             </NativeText>
           </VStack>
          </Center>
        </Button>}
      />

    </VStack>
      <HStack justifyContent='space-between' m={5} px={2}  >
        <Button onPress={ handleGoBack } w='full' flex={1} mr={2}  size={10} > VOLTAR </Button>
        <Button onPress={ update_list }  w='full' flex={1} ml={6} size={10} > ATUALIZAR </Button>
      </HStack>
    </VStack>

  )
}
