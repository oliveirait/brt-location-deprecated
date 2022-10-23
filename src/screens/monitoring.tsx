import React, { useEffect, useState } from 'react';
import { VStack, HStack, Heading, IHeadingProps, Button, Center, Box, Divider  } from 'native-base';
import { Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native'; 
import { Loading } from '../components/Loading';
import { HeadLoading } from '../components/HeadLoading'
import axios from 'axios';
import uuid from 'react-native-uuid';
import Rgoogle from '../data/services/Rgoogle';
import AsyncStorage from '@react-native-async-storage/async-storage';


var KEY_HOUR = '@user-hour'

export function Monitoring( {route} ) {

    const { setItem, getItem } = AsyncStorage 
    const navigation = useNavigation()
    const [len_list, setLenList] = useState(0)
    const [list, setList] = useState([])
    const pos_estacao = `${route.params?.start},${route.params?.end}`
    const station_name = route.params?.station_name
    var lista = []

    function handleGoBack() {
      navigation.goBack()
    }

    async function saveHour () {
      try {
        let time = new Date().toLocaleTimeString().slice(0,5)
        await setItem(KEY_HOUR, time)
        console.log('Hora salva com sucesso', time)
      } catch (e) {
        Alert.alert('Erro de armazenamento', 'Problema ao armazenar a hora')
      }
    }

    async function getHour () {
      try {
        const value = await getItem(KEY_HOUR)
        if (value !== null) {
        }
      } catch (e) {
        Alert.alert('Erro de leitura', 'Problema ao obter os dados')
      }
    }

    function atualizar_dados() {
        update_list()
    }

    async function update_list() {

      var baseUrl = 'https://jeap.rio.rj.gov.br/dadosAbertosAPI/v2/transporte/veiculos/brt'

      var dados_brt = await axios.get(baseUrl)
        .then((response) => {
          return response.data
        })
        .catch((err) => {
          console.log(err)
          Alert.alert('Falha','Erro ao buscar os dados, verifique sua conexão com a internet.')
        })

      for (var i=0; i < dados_brt.length; i++) {
        var ponto = distance(dados_brt[i]['latitude'],dados_brt[i]['longitude'])

        if (ponto <= 1.0) {

          dados_brt[i]['id'] = String(uuid.v4())
          dados_brt[i]['pos_estacao'] = `${pos_estacao}`
          dados_brt[i]['pos_onibus'] = `${dados_brt[i]['latitude']},${dados_brt[i]['longitude']}`
          dados_brt[i]['distancia'] = ponto.toFixed([2]) * 1000

          var dados_google = await Rgoogle(dados_brt[i]['pos_onibus'], dados_brt[i]['pos_estacao'])
          dados_brt[i]['tempo'] = dados_google["routes"][0]["legs"][0]["duration"]["text"]

          lista.push(dados_brt[i])
          }
        }

        lista.forEach( temp => {
          var itinerario = temp['nomeItinerario'].split(' ')
          var destino = temp['nomeLinha'].split(' X ')

          if (itinerario[0] !== 'IDA'){
            temp['sentido'] = destino[0]
          } else {
            temp['sentido'] = destino[1]
          }
        })

      setLenList(lista.length)
      setList(lista)
      saveHour()
    }

    function distance(lat2: any, long2: any) {
      var distance = require('geo-dist-calc');
      var sourcePoints = { latitude: parseFloat(route.params?.start), longitude: parseFloat(route.params?.end) };
      var destinationPoints = { latitude: parseFloat(lat2), longitude: parseFloat(long2) };
      var ResultantDistance = distance.discal(sourcePoints,destinationPoints);
      return ResultantDistance['kilometers']
    }

    useEffect(() => {
      update_list()
    }, [])

    function Iour() {
        setInterval(() => {
            //setRelogio(new Date().toLocaleTimeString())
        }, 60000)
    }

    function HeadingText ( {data}: any) {
      return(
          <Heading size="sm" textAlign='center' fontWeight='normal' color={'green.400'}>
            {data}
          </Heading>
      )
    }

  return(
    <VStack flex={1} w='100%' bg='gray.600' pt={20} >

        <HStack justifyContent='center' alignItems='center'
          pt={6} pb={4} bg='gray.400' borderRadius={20}
          borderWidth={1} borderColor='amber.400'>
          <Box>
            <Heading textAlign='center' color='white' fontSize={40} >
                { station_name }
            </Heading>
          </Box>
        </HStack>

        <HStack justifyContent='center' alignItems='center' pt={2} pb={1} bg='gray.600' space={5} >
          <Heading textAlign='center' color='gray.200' fontSize={25} >
            VEÍCULOS PRÓXIMOS
          </Heading>
          <Heading textAlign='center' color='gray.200' fontSize={25} >
            { len_list != 0 ? len_list : <Loading /> }
          </Heading>
        </HStack>

        <VStack flex={1} h='100%' w='100%' mb={1} pt={2} pb={1} bg='gray.400' 
          borderWidth={1} borderColor='amber.400' borderTopRadius={20} >

          <FlatList 
              showsVerticalScrollIndicator={true}
              data={list}
              ListEmptyComponent={ <HeadLoading /> }
              keyExtractor={ (item) => String(item.id) }
              renderItem={ ({item}) =>

              <Button size="xs" variant="outline" bg={'cyan.900'}
                m={3} borderColor='blue.300' borderRadius={20} alignItems='center' justifyContent='flex-start'>

                <VStack  >
                  <Box >
                    <Heading size="sm" textAlign='left' color='white' fontWeight='normal' >
                      { item['nomeLinha'] }
                    </Heading>
                    <Divider my={1} bg={'gray.300'}/>
                  </Box>
                
                  <Box >
                  
                      <HStack  alignItems='center' justifyContent='flex-start' space={2}>
                        <Heading  size="sm" textAlign='left' color='amber.400' fontWeight='normal' >
                          LINHA 
                        </Heading>
                        <Divider orientation='vertical' bg={'gray.300'}/>
                        <HeadingText data={ item['linha'] } />
                      </HStack>

                      <HStack alignItems='center' justifyContent='flex-start' space={2} >
                        <Heading  size="sm" textAlign='left' color='amber.400' fontWeight='normal' >
                          SENTIDO 
                        </Heading>
                        <Divider orientation='vertical' bg={'gray.300'}/>
                        <HeadingText data={ item['sentido'] }  />
                      </HStack>

                      <HStack alignItems='center' justifyContent='flex-start' space={2}>
                        <Heading  size="sm" textAlign='left' color='amber.400' fontWeight='normal' >
                          ESTIMATIVA 
                        </Heading>
                        <Divider orientation='vertical' bg={'gray.300'} />
                        <HeadingText data={ item['tempo'] } /> 
                      </HStack>
                  </Box>

                  </VStack>
                </Button> } />
        </VStack> 

        <HStack justifyContent='center' mb={4} m={3}
          borderBottomRadius={20} borderColor={'white'} space={4}> 
          <Button onPress={ handleGoBack }
            flex={1} size={12} bg={'cyan.900'}
            borderWidth={1} borderColor='blue.200' >
            <Heading color='white' size={'md'}> VOLTAR </Heading>
          </Button>
          <Button onPress={ atualizar_dados }
            flex={1} size={12} bg={'cyan.900'}
            borderWidth={1} borderColor='blue.200'>
            <Heading color='white' size={'md'}> ATUALIZAR </Heading>
          </Button>
        </HStack>

    </VStack>

  )
}
