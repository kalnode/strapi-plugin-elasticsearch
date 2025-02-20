/**
 *
 * Index component
 *
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import pluginId from '../../pluginId'
import { Link, Box, Button, Icon, Typography, ToggleInput, TextButton, TextInput, Flex, Textarea, Switch, SingleSelect, SingleSelectOption, TabGroup, Tabs, Tab, TabPanels, TabPanel, Grid, Field } from '@strapi/design-system'
import { apiUpdateIndex, apiGetIndex, apiCreateESindex, apiIndexRecords } from '../../utils/apiUrls'
import axiosInstance from '../../utils/axiosInstance'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { Pencil, Trash, ExclamationMarkCircle, Plus } from '@strapi/icons'

export const Index = ({ indexUUID, closeEvent }) => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState(false)
    const [indexRaw,setIndexRaw] = useState(null)
    const [index,setIndex] = useState(null)

    const showNotification = useNotification()

    const changesExist = useMemo(() => index != indexRaw)

    const resetForm = () => {
        setIndex(indexRaw)
    }

    const requestGetIndex = async () => {

        if (indexUUID) {
            setIsInProgress(true)
            let work = await axiosInstance.get(apiGetIndex(indexUUID))
            .then( (response) => {
                if (response.data) {
                    return response.data
                }
            })
            .catch((error) => {
                console.log("PAGE requestGetIndex ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })

            setIndexRaw(work)
            setIndex(work)
        }
        
    }

    const convertEmptyStringsToNulls = (object) => {
        return Object.keys(object).reduce((acc, key) => {
            acc[key] = object[key] === '' ? null : object[key]
            return acc
        }, {})
    }

    const requestUpdateIndex = async () => {

        if (changesExist) {
            setIsInProgress(true)

            let payload = index

            delete payload.mappings
            delete payload.createdAt
            delete payload.updatedAt

            payload = convertEmptyStringsToNulls(payload)

            let work = await axiosInstance.post(apiUpdateIndex(indexUUID), {
                data: payload
            })
            .then( (response) => {
                if (response.data) {
                    return response.data
                }
            })
            .catch((error) => {
                console.log("PAGE INDEX - requestUpdateIndex ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })

            setIndexRaw(work)
            setIndex(work)

        }
    }

    const createOnES = async () => {
        if (indexUUID) {
            setIsInProgress(true)
            let work = await axiosInstance.get(apiCreateESindex(indexUUID))
            .then( (response) => {
                console.log("get createOnES 111: ", response)
                if (response.data) {
                    return response.data
                }
            })
            .catch((error) => {
                console.log("PAGE createOnES ERROR: ", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })
        }
    }

    const indexRecords = async () => {
        setIsInProgress(true)
        let work = await axiosInstance.get(apiIndexRecords(indexUUID))
        .then( (response) => {
            console.log("get indexRecords 111: ", response)
            if (response.data) {
                return response.data
            }
        })
        .catch((error) => {
            console.log("PAGE indexRecords ERROR: ", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(() => {
            setIsInProgress(false)
        })
    }

    // ===============================
    // LIFECYCLE
    // ===============================

    useEffect(() => {
        if (indexUUID) {
            requestGetIndex()
        }
    }, [])


    return  (
        <Flex width="100%" direction="column" alignItems="start" gap={4}>
            { index && (
                <>
                <Flex width="100%" justifyContent="space-between">
                    <Box>
                        <Typography variant="alpha">{ indexUUID ? 'Index ' + indexUUID : 'Create Index'}</Typography>
                    </Box>

                    <Flex gap={4}>

                        { changesExist && (
                            <>
                            <Icon as={ExclamationMarkCircle} />
                            <Typography variant="sigma">Unsaved changes</Typography>
                            <TextButton onClick={() => resetForm()}>
                                Reset
                            </TextButton>
                            </>
                        )}

                        { indexUUID && (
                            <Button onClick={() => requestUpdateIndex()} variant="tertiary" disabled={!changesExist}>
                                Save
                            </Button>
                        )}
                    </Flex>
                </Flex>

                <Flex width="100%" direction="column" alignItems="start" gap={4}>

                    <Box width="100%" background="neutral0" padding={8} shadow="filterShadow">
                        <TextInput value={ index.index_name ? index.index_name : '' } onChange={(event) => setIndex({...index,index_name: event.target.value}) } label="Index name" placeholder="Enter index name" name="Index name field" />
                    </Box>

                    <Box width="100%" background="neutral0" padding={8} shadow="filterShadow">
                        <TextInput value={ index.index_alias ? index.index_alias : '' } onChange={(event) => setIndex({...index,index_alias: event.target.value}) } label="Alias name" placeholder="Enter alias name" name="Index alias field" />
                    </Box>

                    <Box width="100%" background="neutral0" padding={8} shadow="filterShadow">
                        <Box>
                            <Flex direction="column" alignItems="start" gap={4}>
                                <Typography variant="delta">State</Typography>
                                <Switch
                                    onClick={ () => setIndex({...index,active: index.active ? null : true })}
                                    selected={ index.active ? true : null }
                                    visibleLabels
                                    onLabel = 'Enabled'
                                    offLabel = 'Disabled'
                                />
                                {/* onClick={toggleIndexingEnabled}
                                    selected={indexingEnabled} */}
                            </Flex>
                        </Box>
                    </Box>

                    <Box width="100%" background="neutral0" padding={8} shadow="filterShadow">
                        <Link to={`/plugins/${pluginId}/indexes/${index.uuid}/mappings`}>
                            <Button variant="secondary">
                                Mappings for Index
                            </Button>
                        </Link>
                    </Box>

                    <Box width="100%" background="neutral0" padding={8} shadow="filterShadow">
                        <Button variant="secondary" onClick={ () => createOnES()}>
                            Create index on ES instance with current mappings
                        </Button>

                        <Button variant="secondary" onClick={ () => console.log("Delete index")}>
                            Delete index
                        </Button>

                        <Button variant="secondary" onClick={ () => console.log("Re-build index")}>
                            Re-build index
                        </Button>

                        <Button variant="secondary" onClick={ () => indexRecords()}>
                            Index all records
                        </Button>


                    </Box>
                    
                </Flex>
                </>
            )}

        </Flex>
    )
}