import React, { useEffect, useState } from 'react';
import { VStack, HStack, Heading, IHeadingProps, Button, Center, Box, Divider, useToast  } from 'native-base';
import { Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native'; 
import { Loading } from '../components/Loading';
import { HeadLoading } from '../components/HeadLoading'
import axios from 'axios';
import uuid from 'react-native-uuid';
import Rgoogle from '../data/services/Rgoogle';
import AsyncStorage from '@react-native-async-storage/async-storage';



const LAST_LIST = '@save-timestamp'


export function Monitoring( {route} ) {

    const { setItem, getItem } = AsyncStorage 
    const { goBack } = useNavigation()
    const [len_list, setLenList] = useState(0)
    const [list, setList] = useState([])
    const pos_estacao = `${route.params?.start},${route.params?.end}`
    const station_name = route.params?.station_name
    var lista = []
    var reloaded_list = []
    const toast = useToast() 

    async function saveLastUpdate (key, list) {
      try {
        // let timestamp = new Date().toLocaleTimeString().slice(0,5)
        await setItem(key, JSON.stringify(list))
      } catch (e) {
        Alert.alert('Erro de armazenamento', 'Problema ao armazenar informações, contate o desenvolvedor.')
      }
    }

    async function getLastUpdate(key) {
      try {
        var item = await getItem(key).then(JSON.parse)
        if (item === !null) {
          return item
        }
        } catch (e) {
        Alert.alert('Erro de leitura', 'Problema ao obter os dados')
      }
    }

    async function update_list() {
      var dados_brt = await axios.get('https://jeap.rio.rj.gov.br/dadosAbertosAPI/v2/transporte/veiculos/brt')
        .then( (response) => {
          return response.data
        })
        .catch((err) => {
          console.log(err)
          Alert.alert('Falha na conexão','Erro ao buscar os dados, verifique sua conexão com a internet.')
        })

      saveLastUpdate(LAST_LIST, dados_brt)

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
        if (lista.length > 0) {
          toast.show({ 
            placement: 'top',
            render: () => {
              return(
                <Center bg="emerald.500" rounded="sm" mb={100} p={3} >
                  <Heading textAlign='center' color='white' w='full'>
                    Lista atualizada!
                  </Heading>
                </Center>
              )
            }
          })

          setLenList(lista.length)
          setList(lista)
      }
    }

    async function reload_list() {
      toast.show({ 
        placement: 'top',
        render: () => {
          return(
            <Center bg="yellow.500" rounded="sm" mb={100} p={3} >
              <Heading textAlign='center' color='white' w='full'>
              ﾠﾠﾠﾠﾠﾠﾠﾠﾠﾠBuscando novos dados...ﾠﾠﾠﾠﾠﾠﾠﾠﾠﾠ
              </Heading>
            </Center>
          )
        }
      })
      var old_list = await getItem(LAST_LIST).then(JSON.parse).then(value => value)
      var new_list = await axios.get('https://jeap.rio.rj.gov.br/dadosAbertosAPI/v2/transporte/veiculos/brt')
      .then( (response) => {
        return response.data
      }).catch((err) => {
        console.log(err)
        Alert.alert('Falha na conexão','Erro ao buscar os dados, verifique sua conexão com a internet.')
      })

      console.log(old_list.length)
      console.log(new_list.length)

      if (new_list.length === old_list.length) {
        for (var i=0; i < new_list.length; i++) {
          if ( new_list[i]['comunicacao'] !== old_list[i]['comunicacao'] ) {
            var ponto = distance(new_list[i]['latitude'],new_list[i]['longitude'])
            if (ponto <= 1.0) {
              new_list[i]['id'] = String(uuid.v4())
              new_list[i]['pos_estacao'] = `${pos_estacao}`
              new_list[i]['pos_onibus'] = `${new_list[i]['latitude']},${new_list[i]['longitude']}`
              new_list[i]['distancia'] = ponto.toFixed([2]) * 1000
              var dados_google = await Rgoogle(new_list[i]['pos_onibus'], new_list[i]['pos_estacao'])
              new_list[i]['tempo'] = dados_google["routes"][0]["legs"][0]["duration"]["text"]
              reloaded_list.push(new_list[i])
            }
          }
        }
        reloaded_list.forEach( (temp) => {
          var itinerario = temp['nomeItinerario'].split(' ')
          var destino = temp['nomeLinha'].split(' X ')
          if (itinerario[0] !== 'IDA'){
            temp['sentido'] = destino[0]
          } else {
            temp['sentido'] = destino[1]
          }
        })
        setLenList(reloaded_list.length)
        setList(reloaded_list)
        //saveLastUpdate(LAST_LIST, reloaded_list)
      } 
      
      else {
        saveLastUpdate(LAST_LIST, new_list)
      }
    }

    function distance(lat2: any, long2: any) {
      var distance = require('geo-dist-calc');
      var sourcePoints = { latitude: parseFloat(route.params?.start), longitude: parseFloat(route.params?.end) };
      var destinationPoints = { latitude: parseFloat(lat2), longitude: parseFloat(long2) };
      var ResultantDistance = distance.discal(sourcePoints,destinationPoints);
      return ResultantDistance['kilometers']
    }

    useEffect( () => {
      update_list()
    }, [])

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
          <Button onPress={ goBack }
            flex={1} size={12} bg={'cyan.900'}
            borderWidth={1} borderColor='blue.200' >
            <Heading color='white' size={'md'}> VOLTAR </Heading>
          </Button>
          <Button onPress={ reload_list }
            flex={1} size={12} bg={'cyan.900'}
            borderWidth={1} borderColor='blue.200'>
            <Heading color='white' size={'md'}> ATUALIZAR </Heading>
          </Button>
        </HStack>

    </VStack>

  )
}
