/**
 *
 * COMPONENT: Index
 *
 */

import { useEffect, useState, useMemo } from 'react'
import pluginId from '../../pluginId'
import { Link, Box, Button, Tooltip, Icon, Typography, ModalLayout, ModalHeader, ModalFooter, ModalBody, ToggleInput, TextButton, TextInput, Flex, Textarea, Switch, SingleSelect, SingleSelectOption, TabGroup, Tabs, Tab, TabPanels, TabPanel, Grid, Field } from '@strapi/design-system'
import { apiUpdateIndex, apiSyncIndex, apiDeleteESIndex, apiGetIndex, apiCreateESindex, apiIndexRecords } from '../../utils/apiUrls'
import axiosInstance from '../../utils/axiosInstance'
import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import { Pencil, Trash, ExclamationMarkCircle, Plus } from '@strapi/icons'
import { RegisteredIndex } from "../../../../types"
import { Information } from '@strapi/icons'

type Props = {
    indexUUID: string
}

export const Index = ({ indexUUID }:Props) => {

    // ===============================
    // GENERAL
    // ===============================

    const [isInProgress, setIsInProgress] = useState<boolean>(false)
    const [indexOriginal,setIndexOriginal] = useState<RegisteredIndex>()
    const [index,setIndex] = useState<RegisteredIndex>()
    const [showNameAliasModal, setShowNameAliasModal] = useState<boolean>(false)
    const showNotification = useNotification()

    const changesExist = useMemo(() => JSON.stringify(index) != JSON.stringify(indexOriginal), [index])

    const resetForm = () => {
        setIndex(indexOriginal)
    }

    // TODO: Early work; keep for now.
    // const convertEmptyStringsToNulls = (object:object) => {
    //     return Object.keys(object).reduce((acc, key) => {
    //         // TODO: Type this correctly... or... maybe we don't need this func at all, so blow it away.
    //         // @ts-ignore
    //         acc[key] = object[key] === '' ? null : object[key]
    //         return acc
    //     }, {})
    // }


    useEffect(() => {
        if (indexUUID) {
            requestGetIndex()
        }
    }, [])

    // ===============================
    // API REQUESTS
    // ===============================

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
                console.log("COMPONENT Index - requestGetIndex error", error)
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

    const requestCreateIndexOnES = async () => {
        if (indexUUID) {
            setIsInProgress(true)
            await axiosInstance.get(apiCreateESindex(indexUUID))
            // .then( (response) => {
            //     if (response.data) {
            //         return response.data
            //     }
            // })
            .catch((error) => {
                console.log("COMPONENT Index - requestCreateIndexOnES error", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })
        }
    }

    const requestDeleteIndexOnES = async () => {
        if (index) {
            setIsInProgress(true)
            await axiosInstance.get(apiDeleteESIndex(index.index_name))
            // .then( (response) => {
            //     if (response.data) {
            //         return response.data
            //     }
            // })
            .catch((error) => {
                console.log("COMPONENT Index - requestDeleteIndexOnES error", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })
        }
    }

    const requestIndexAllRecords = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiIndexRecords(indexUUID))
        .then( (response) => {
            if (response.data) {
                return response.data
            }
        })
        .catch((error) => {
            console.log("COMPONENT Index - error:", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(() => {
            setIsInProgress(false)
        })
    }

    const requestUpdateIndex = async () => {

        if (index && changesExist) {
            setIsInProgress(true)

            let payload:RegisteredIndex = index

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
            .then( async (response) => {
                if (response.data) {                    
                    setIndexOriginal(response.data)
                    setIndex(response.data)
                }
            })
            .catch((error) => {
                console.log("COMPONENT Index - requestUpdateIndex error:", error)
                showNotification({
                    type: "warning", message: "An error has encountered: " + error, timeout: 5000
                })
            })
            .finally(() => {
                setIsInProgress(false)
            })

        }
    }

    const requestSyncIndex = async () => {
        setIsInProgress(true)

        await axiosInstance.get(apiSyncIndex(indexUUID))
        .then( (response) => {
            console.log("Sync response is: ", response)
        })
        .catch((error) => {
            console.log("COMPONENT Index - requestSyncIndex error:", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(() => {
            setIsInProgress(false)
        })
    }



    // ===============================
    // TEMPLATE
    // ===============================

    return  (

        <Flex width="100%" height="100%" direction="column" alignItems="start" gap={4} background="neutral100">

            { index && (
                <>

                {/* ---------------------------------------------- */}
                {/* HEADER */}
                {/* ---------------------------------------------- */}
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
                                <TextButton onClick={ () => resetForm() }>
                                    Reset
                                </TextButton>
                            </>
                        )}

                        <Button onClick={ () => requestUpdateIndex() } variant="secondary" disabled={!changesExist}>
                            Save
                        </Button>
                        <Button onClick={ () => requestSyncIndex() } variant="secondary">
                            Sync
                        </Button>

                        {/* { indexUUID && (
                            <Flex gap={4}>
                                <Switch
                                onClick={ () => setIndex({...index, active: index.active ? false : true }) }
                                selected={ index.active ? true : null }
                                visibleLabels
                                onLabel = 'On'
                                offLabel = 'Off'
                                />
                                <Tooltip label="On = Triggers activated for specified post types">
                                    <button aria-label="delete">
                                        <Icon as={Information} color="neutral300" variant="primary" aria-hidden focusable={false} />
                                    </button>
                                </Tooltip>
                            </Flex>
                        )} */}

                    </Flex>
                </Flex>


                {/* ---------------------------------------------- */}
                {/* CONTENT */}
                {/* ---------------------------------------------- */}
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
                            <Button variant="secondary" onClick={ () => setShowNameAliasModal(true) }>
                                Change
                            </Button>
                        </Box>
                    </Flex>

                    {/* // ON/OFF SWITCH IN-PAGE */}
                    <Box width="100%" background="neutral0" padding={8} shadow="filterShadow">
                        <Box>
                            <Flex direction="column" alignItems="start" gap={4}>
                                <Typography variant="beta">Operational State</Typography>
                                <Typography variant="delta">On = Indexeding of Strapi records will occur, if the records' type matches a type activated in the index mappings.</Typography>
                                <Typography variant="delta">Off = No indexing will occur when Strapi records are updated.</Typography>
                                <Switch
                                    onClick={ () => setIndex({...index, active: index.active ? false : true }) }
                                    selected={ index.active ? true : null }
                                    visibleLabels
                                    onLabel = 'Enabled'
                                    offLabel = 'Disabled'
                                />
                            </Flex>
                        </Box>
                    </Box>

                    <Box width="100%" background="neutral0" padding={8} shadow="filterShadow">
                        <Flex>
                            <Box>
                                <Flex direction="column" alignItems="start" gap={4}>
                                    <Typography variant="beta">Dynamic Mapping</Typography>
                                    <Typography variant="delta">Allow new mapping fields to be automatically added to the index when indexing a document.</Typography>
                                    <Switch
                                        onClick={ () => setIndex({...index, mapping_dynamic: index.mapping_dynamic ? false : true }) }
                                        selected={ index.mapping_dynamic ? true : null }
                                        visibleLabels
                                        onLabel = 'Enabled'
                                        offLabel = 'Disabled'
                                    />
                                </Flex>
                            </Box>
                            <Link to={`/plugins/${pluginId}/indexes/${index.uuid}/mappings`}>
                                <Button variant="primary" style={{ color:'white' }}>
                                    Mappings
                                </Button>
                            </Link>
                        </Flex>                        
                    </Box>

                    <Box width="100%" background="neutral0" padding={8} shadow="filterShadow">
                        <Button variant="secondary" onClick={ () => requestCreateIndexOnES() }>
                            Create index on ES instance with current mappings
                        </Button>

                        <Button variant="secondary" onClick={ () => requestDeleteIndexOnES() }>
                            Delete index
                        </Button>

                        <Button variant="secondary" onClick={ () => console.log("Re-build index") }>
                            Re-build index
                        </Button>

                        <Button variant="secondary" onClick={ () => requestIndexAllRecords() }>
                            Index all records
                        </Button>

                    </Box>
                    
                </Flex>
                </>
            )}


            {/* ---------------------------------------------- */}
            {/* MODAL: CHANGE INDEX NAME/ALIAS */}
            {/* ---------------------------------------------- */}
            { showNameAliasModal && (
                <ModalLayout onClose={() => setShowNameAliasModal(false) }>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Change name/alias
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        { index && (
                            <Box width="100%" padding={8}>
                                <TextInput value={ index.index_name ? index.index_name : '' } onChange={ (e:Event) => setIndex({ ...index, index_name: (e.target as HTMLInputElement).value }) } label="Index name" placeholder="Enter index name" name="Index name field" />
                                <TextInput value={ index.index_alias ? index.index_alias : '' } onChange={ (e:Event) => setIndex({ ...index, index_alias: (e.target as HTMLInputElement).value }) } label="Alias name" placeholder="Enter alias name" name="Index alias field" />
                            </Box>
                        )}

                        ( user journey will be invoked on re-building the entire index)
                    </ModalBody>
                    <ModalFooter
                        startActions={<>
                            <Button onClick={ () => setShowNameAliasModal(false) } variant="secondary">
                                Cancel
                            </Button>
                        </>}
                        endActions={<>
                            <Flex width="100%" justifyContent="end" gap={4}>
                            <Button onClick={ () => setShowNameAliasModal(false) } variant="primary">
                                Cancel
                            </Button>
                            </Flex>
                        </>}
                    />
                </ModalLayout>

            ) }

        </Flex>
    )
}