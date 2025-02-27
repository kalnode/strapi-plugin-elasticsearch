/**
 *
 * Index component
 *
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import pluginId from '../../pluginId'
import { Link, Box, Button, Tooltip, Icon, Typography, ModalLayout, ModalHeader, ModalFooter, ModalBody, ToggleInput, TextButton, TextInput, Flex, Textarea, Switch, SingleSelect, SingleSelectOption, TabGroup, Tabs, Tab, TabPanels, TabPanel, Grid, Field } from '@strapi/design-system'
import { apiUpdateIndex, apiGetIndex, apiCreateESindex, apiIndexRecords } from '../../utils/apiUrls'
import axiosInstance from '../../utils/axiosInstance'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { Pencil, Trash, ExclamationMarkCircle, Plus } from '@strapi/icons'
import { RegisteredIndex } from "../../../../types"
import { Information } from '@strapi/icons'

type Props = {
    indexUUID: string
    closeEvent?: any // TODO: Need to type this properly for passed event callback
}

export const Index = ({ indexUUID, closeEvent }:Props) => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState<boolean>(false)
    const [indexOriginal,setIndexOriginal] = useState<RegisteredIndex>()
    const [index,setIndex] = useState<RegisteredIndex>()
    const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)
    const showNotification = useNotification()

    const changesExist = useMemo(() => JSON.stringify(index) != JSON.stringify(indexOriginal), [index])

    const resetForm = () => {
        setIndex(indexOriginal)
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

            setIndexOriginal(work)
            setIndex(work)
        }
        
    }

    const convertEmptyStringsToNulls = (object:object) => {
        return Object.keys(object).reduce((acc, key) => {

            // TODO: Type this correctly... or... maybe we don't need this func at all, so blow it away.
            // @ts-ignore
            acc[key] = object[key] === '' ? null : object[key]
            return acc
        }, {})
    }

    const requestUpdateIndex = async () => {

        if (index && changesExist) {
            setIsInProgress(true)

            let payload:RegisteredIndex = index

            if (payload) {

                // TODO: Need comment; why are we doing this?
                delete payload.mappings
                // TODO: Legacy from db paradigm; keep for now
                //delete payload.createdAt
                //delete payload.updatedAt

                // TODO: Do we need this? Were we only using it for createdAt and updatedAt ?
                //payload = convertEmptyStringsToNulls(payload)

                await axiosInstance.post(apiUpdateIndex(indexUUID), {
                    data: payload
                })
                .then( (response) => {
                    if (response.data) {
                        setIndexOriginal(response.data)
                        setIndex(response.data)
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
                
            }

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
                    <Flex direction="column" alignItems="start">
                        <Typography variant="alpha">{ indexUUID ? index.index_name : 'Create Index'}</Typography>
                        { indexUUID && (
                            <Typography variant="delta">UUID: { indexUUID }</Typography>
                        )}
                    </Flex>

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
                            <Flex gap={4}>
                                <Switch
                                onClick={ () => setIndex({...index, active: index.active ? false : true })}
                                selected={ index.active ? true : null }
                                visibleLabels
                                onLabel = 'On'
                                offLabel = 'Off'
                                />
                                <Tooltip label="On = Triggers activated for specified post types">
                                    <button aria-label="delete">
                                        {/* <Trash aria-hidden focusable={false} /> */}
                                        <Icon as={Information} color="neutral300" variant="primary" />
                                        {/* aria-hidden focusable={false} */}
                                    </button>
                                </Tooltip>
                                {/* <Icon as={Information} color="neutral300" variant="primary" /> */}
                               
                            </Flex>
                        )}

                        {/* { indexUUID && (
                            <Button onClick={() => requestUpdateIndex()} variant="tertiary" disabled={!changesExist}>
                                Save
                            </Button>
                        )} */}
                    </Flex>
                </Flex>

                <Flex width="100%" direction="column" alignItems="start" gap={4}>

                    <Flex width="100%" background="neutral0" padding={8} shadow="filterShadow" justifyContent="space-apart">
                        <Flex direction="column" alignItems="start" gap={4}>
                            <Box><Typography variant="delta" fontWeight="bold">Index name:</Typography> { index.index_name }</Box>
                            <Box>
                                <Typography variant="delta" fontWeight="bold">Index alias:</Typography>&nbsp;
                                { index.index_alias && (
                                    <>{ index.index_alias }</>
                                )}
                                { !index.index_alias && (
                                    <Typography textColor="neutral300">not defined</Typography>
                                )}
                            </Box>
                        </Flex>

                        {/* TODO: justifyItems="end" doesn't seem to work as a Strapi attribute. For now: using it in style=. */}
                        <Box flex="1" style={{ justifyItems: 'flex-end' }}>
                            <Button variant="secondary" onClick={ () => setShowSettingsModal(true)}>
                                Change
                            </Button>
                        </Box>
                    </Flex>

                    {/* <Box width="100%" background="neutral0" padding={8} shadow="filterShadow">
                        <Box>
                            <Flex direction="column" alignItems="start" gap={4}>
                                <Typography variant="delta">State</Typography>
                                <Switch
                                    onClick={ () => setIndex({...index, active: index.active ? false : true })}
                                    selected={ index.active ? true : null }
                                    visibleLabels
                                    onLabel = 'Enabled'
                                    offLabel = 'Disabled'
                                />
                            </Flex>
                        </Box>
                    </Box> */}

                    <Box width="100%" background="neutral0" padding={8} shadow="filterShadow">
                        <Link to={`/plugins/${pluginId}/indexes/${index.uuid}/mappings`}>
                            <Button variant="secondary">
                                Mappings for Index
                            </Button>
                        </Link>
                        <Link to={`/plugins/${pluginId}/indexes/${index.uuid}/mappingsnew`}>
                            <Button variant="secondary">
                                Mappings New for Index
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



            { showSettingsModal && (
                <ModalLayout onClose={() => setShowSettingsModal(false) }>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Select preset mapping
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        { index && (
                            <Box width="100%" padding={8}>
                                <TextInput value={ index.index_name ? index.index_name : '' } onChange={(e:Event) => setIndex({ ...index, index_name: (e.target as HTMLInputElement).value }) } label="Index name" placeholder="Enter index name" name="Index name field" />
                                <TextInput value={ index.index_alias ? index.index_alias : '' } onChange={(e:Event) => setIndex({ ...index, index_alias: (e.target as HTMLInputElement).value }) } label="Alias name" placeholder="Enter alias name" name="Index alias field" />
                            </Box>
                        )}
                    </ModalBody>
                    {/* <ModalFooter
                        startActions={<></>}
                        endActions={<></>}
                    /> */}
                </ModalLayout>

            ) }

        </Flex>
    )
}