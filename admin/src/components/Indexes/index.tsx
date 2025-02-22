import { useState, useEffect } from 'react'
import pluginId from '../../pluginId'

import { Box, Flex, Button, ModalLayout, ModalHeader, ModalFooter, ModalBody, FieldInput, Switch, TextButton, Table, Thead, Tbody, Tr, Td, Th, TFooter, Typography, EmptyStateLayout, Checkbox, TabGroup, Tabs, Tab, TabPanels, TabPanel, Field, TextInput, IconButton, CaretDown } from '@strapi/design-system'
import { Pencil, Trash, Refresh, Plus, Cross } from '@strapi/icons'
import '../../styles/styles.css'

import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import axiosInstance  from '../../utils/axiosInstance'
import { apiGetIndexes, apiCreateIndex, apiDeleteIndex, apiGetESIndexes } from '../../utils/apiUrls'
import { useHistory } from "react-router-dom"

import { RegisteredIndex } from "../../../../types"


// NOTE: The "Indexes" component exists simply for file consistency, even though it will only ever have one instance (the main Indexes page).

export const ComponentIndexes = () => {

    const [isInProgress, setIsInProgress] = useState<boolean>(false)
    const [indexes, setIndexes] = useState<Array<RegisteredIndex>>()
    const [ESIndexes, setESIndexes] = useState<Array<string>>()
    const [modalCreateIndexShow, setModalCreateIndexShow] = useState<boolean>(false)
    const [newIndexName, setNewIndexName] = useState<string>('')
    const [addToElasticsearch, setAddToElasticsearch] = useState<boolean>(true)
    const [useNamePrepend, setUseNamePrepend] = useState<boolean>(false)
    const namePrepend = "strapi_es_plugin_"
    const [modalRegisterExistingIndexShow, setModalRegisterExistingIndexShow] = useState<boolean>(false)
    const [modalDeleteIndexShow, setModalDeleteIndexShow] = useState<boolean>(false)
    const [indexUUIDToBeDeleted, setIndexUUIDToBeDeleted] = useState<string>()
    const [deleteFromElasticsearch, setDeleteFromElasticsearch] = useState<boolean>(false)
    const history = useHistory()
    const showNotification = useNotification()

    useEffect(() => {
        requestGetRegisteredIndexes()
    }, [])

    const requestGetRegisteredIndexes = async () => {
        setIsInProgress(true)
        await axiosInstance.get(apiGetIndexes)
        .then((response) => {
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                setIndexes(response.data)
            } else {
                setIndexes(undefined)
            }
        })
        .catch((error) => {
            console.log("PAGE INDEXES - requestGetRegisteredIndexes ERROR: ", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(() => {
            setIsInProgress(false)
        })
    } 

    const requestCreateIndex = (indexName:string, addToExternalIndex?:boolean) => {
        setIsInProgress(true)        
        return axiosInstance.post(apiCreateIndex, {
            data: {
                indexName: indexName,
                addToExternalIndex: addToExternalIndex
            }
        })
        .catch((error) => {
            console.log("PAGE INDEXES - requestCreateIndex ERROR: ", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(() => {
            requestGetRegisteredIndexes()
        })
    }

    const modalCreateOpen = () => {
        setNewIndexName('')
        setUseNamePrepend(false)
        setModalCreateIndexShow(true)
    }

    const modalRegExistingIndexOpen = async () => {
        setNewIndexName('')
        console.log("modalRegExistingIndexOpen 111")
        await getESIndexes()
        console.log("modalRegExistingIndexOpen 222")
        setModalRegisterExistingIndexShow(true)
    }

    const createIndexActual = () => {
        setModalCreateIndexShow(false)
        let name = useNamePrepend ? namePrepend + newIndexName : newIndexName
        requestCreateIndex(name, addToElasticsearch)
    }

    const registerExistingIndexActual = () => {
        setModalRegisterExistingIndexShow(false)
        requestCreateIndex(newIndexName)
    }

    const getESIndexes = async () => {
        setIsInProgress(true)
        console.log("getESIndexes 111")
        await axiosInstance.get(apiGetESIndexes)
        .then((response) => {
            if (response.data && Object.keys(response.data).length > 0) {
                setESIndexes(Object.keys(response.data))
            } else {
                setESIndexes(undefined)
            }
        })
        .catch((error) => {
            console.log("PAGE INDEXES - getESIndexes ERROR: ", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(() => {
            setIsInProgress(false)
        })
        console.log("getESIndexes 222")
    }


    const modalDeleteOpen = (e:Event, indexUUID:string) => {
        e.stopPropagation()
        setIndexUUIDToBeDeleted(indexUUID)
        setDeleteFromElasticsearch(false)
        setModalDeleteIndexShow(true)
    }

    const requestDeleteIndex = async () => {
        setModalDeleteIndexShow(false)
        setIsInProgress(true)
        await axiosInstance.post(apiDeleteIndex, {
            data: {
                indexUUID: indexUUIDToBeDeleted,
                deleteIndexInElasticsearch: deleteFromElasticsearch
            }
        })
        .catch((error) => {
            console.log("PAGE INDEXES - requestDeleteIndex ERROR: ", error)
            showNotification({
                type: "warning", message: "An error has encountered: " + error, timeout: 5000
            })
        })
        .finally(() => {
            requestGetRegisteredIndexes()
        })
    }

    return (

        <Flex width="100%" direction="column" alignItems="start" gap={2} background="neutral100">

            {/* -------- TITLE -------- */}
            <Box>
                <Typography variant="alpha">Registered Indexes</Typography>
            </Box>

            {/* -------- ACTIONS -------- */}
                <Flex width="100%" gap={4} justifyContent="space-between">
                    <Box>
                        {/* <IconButton onClick={requestGetRegisteredIndexes} label="Create Index" icon={<Refresh />} /> */}
                    </Box>
                    <Flex gap={4}>
                        <Button variant="secondary" onClick={() => modalCreateOpen()} startIcon={<Plus />}>Create Index</Button>
                        <Button variant="secondary" onClick={() => modalRegExistingIndexOpen()} startIcon={<Plus />}>Register Existing Index</Button>
                    </Flex>
                </Flex>

            {/* -------- CONTENT -------- */}
            <Box width="100%">
                { (!indexes || (indexes && indexes.length) === 0) && (
                    <EmptyStateLayout icon={<Cross />} content="You don't have any registered indexes yet..." action={
                        <Flex gap={4}>
                            <Button variant="secondary" onClick={() => modalCreateOpen()} startIcon={<Plus />}>Create Index</Button>
                            <Button variant="secondary" onClick={() => modalRegExistingIndexOpen()} startIcon={<Plus />}>Register Existing Index</Button>
                        </Flex>
                    } />
                )}

                { indexes && Array.isArray(indexes) && indexes.length > 0 && (
                    <>
                    <Table colCount={7} rowCount={indexes.length} width="100%">
                    {/* footer={<TFooter icon={<Plus />}>Add another field to this collection type</TFooter>} */}
                        <Thead>
                            <Tr>
                                <Th>
                                    <Checkbox aria-label="Select all entries" className="checkbox" />
                                </Th>
                                <Th>
                                    <Typography variant="sigma">UUID</Typography>
                                </Th>
                                <Th>
                                {/* action={<IconButton label="Sort on ID" borderWidth={0}>
                                        <CaretDown />
                                    </IconButton>} */}
                                    <Typography variant="sigma">ES Index Name</Typography>
                                </Th>
                                {/* <Th>
                                    <Typography variant="sigma">Name</Typography>
                                </Th> */}
                                <Th>
                                    <Typography variant="sigma">Alias</Typography>
                                </Th>
                                <Th width={50}>
                                    <Typography variant="sigma">Mappings</Typography>
                                </Th>
                                {/* <Th width={50}>
                                    <Typography variant="sigma">Raw Mapping</Typography>
                                </Th> */}
                                <Th>
                                    <Typography variant="sigma">Active</Typography>
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            { indexes.map((data, index) => {
                                return (
                                    <Tr key={index} className="row" onClick={() => history.push(`/plugins/${pluginId}/indexes/${data.uuid}`)}>
                                        <Td>
                                            <Checkbox aria-label={`Select ${data.index_name}`} className="checkbox" />
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{data.uuid}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{data.index_name}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{data.index_alias}</Typography>
                                        </Td>
                                        <Td>
                                            <Typography textColor="neutral600">{data.mappings && data.mappings.length > 0 ? data.mappings.length : ''}</Typography>
                                        </Td>
                                        {/* <Td>
                                            <Typography textColor="neutral600">?</Typography>
                                        </Td> */}
                                        <Td>
                                            <Typography textColor="neutral600">{data.active ? 'Yes':''}</Typography>
                                        </Td>
                                        <Td>
                                            <Flex alignItems="end" gap={2}>
                                                <IconButton label="Edit" borderWidth={0} icon={<Pencil />} />                                                  
                                                <IconButton onClick={(e:Event) => modalDeleteOpen(e, data.uuid)} label="Delete" borderWidth={0} icon={<Trash />} />                                                
                                            </Flex>
                                        </Td>
                                    </Tr>
                                )
                            }) }
                        </Tbody>
                    </Table>
                    <Box paddingTop={2} paddingBottom={2}>
                        <Typography textColor="neutral600">This view lists registered indexes (in the context of this plugin).</Typography>
                    </Box>
                    </>
                )}
            </Box>

            { modalCreateIndexShow && (
                <ModalLayout onClose={() => setModalCreateIndexShow(false)}>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Create a Registered Index
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        <Flex direction="column" alignItems="start" gap={8}>
                            <Flex direction="column" alignItems="start" gap={4} width="100%">
                                <Typography as="h2" variant="beta">Index name</Typography>
                                <>
                                    Decide on a name that's concise, descriptive and unique enough to recognizeable in an ES instance.
                                </>
                                <Flex gap={4} alignItems="end" width="100%">
                                    {/* {useNamePrepend && (<>strapi_es_plugin_</>) } */}
                                    <Box width="100%">
                                        <TextInput value={newIndexName} onChange={(e:Event) => setNewIndexName((e.target as HTMLInputElement).value) } label="New index name" placeholder="Enter a new index name, e.g. 'myWebsite_testIndex'" name="newIndexName" />
                                    </Box>
                                </Flex>
                                <Flex gap={4}>
                                    <Checkbox aria-label="Add prepend text" className="checkbox" checked={useNamePrepend} onChange={ () => setUseNamePrepend(!useNamePrepend)} />
                                    <Box onClick={ () => setUseNamePrepend(!useNamePrepend)} cursor="pointer">Prepend with "{namePrepend}"</Box>
                                </Flex>
                            </Flex>

                            <Flex direction="column" alignItems="start" gap={4}>
                                <Typography as="h2" variant="beta">Create in Elasticsearch instance</Typography>
                                <Typography variant="delta">
                                    By default, the plugin will attempt to create this index in the connected Elasticsearch instance.
                                    You may turn this off and do this step later via the plugin UI, or manually create an ES index yourself.
                                </Typography>
                                <Flex gap={4}>
                                    <>Create index in ES instance?</>
                                    <Switch
                                        onClick={ () => setAddToElasticsearch(!addToElasticsearch) }
                                        selected={ addToElasticsearch ? true : null }
                                        visibleLabels
                                        onLabel = 'Yes'
                                        offLabel = 'No'
                                    />
                                </Flex>
                            </Flex>

                            
                        </Flex>
                    </ModalBody>
                    <ModalFooter
                        startActions={<></>}
                        endActions={<>
                            <Flex width="100%" justifyContent="end" gap={4}>
                                <Flex>
                                    {useNamePrepend && (<>{namePrepend}</>) }
                                    {newIndexName}
                                </Flex>

                                <Button onClick={createIndexActual} disabled={!newIndexName} variant="primary">
                                    {addToElasticsearch && (<>Create index & add to Elasticsearch</>) }
                                    {!addToElasticsearch && (<>Create index</>) }
                                </Button>
                            </Flex>
                        </>}
                    />
                </ModalLayout>
            )}

            { modalRegisterExistingIndexShow && (
                <ModalLayout onClose={() => setModalRegisterExistingIndexShow(false)}>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Register existing index
                        </Typography>
                    </ModalHeader>
                    <ModalBody>

                        <Box width="100%">

                        {/* style={{ height: '200px', overflow: 'hidden'}} */}
                            <TabGroup initialSelectedTabIndex={0} width="100%" height="100%" style={{ 
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',

                                // TODO: Fix this.
                                // We want proper overflow scrolling on a nested list.
                                // After tons of wrestling, still do not have a good situation.
                                // For now applying "50vh" and the correct regions seem to over flow,
                                // however the list is cut-off at the bottom.
                                height: '50vh'
                            }}>

                                {/* -------- TABS ACTUAL ------------------*/}
                                <Tabs>
                                    <Tab id="typeName">Input a Name</Tab>
                                    <Tab id="chooseFromList">Select from List</Tab>
                                </Tabs>

                                <TabPanels style={{ overflow: 'hidden' }}>

                                    <TabPanel id="typeName">
                                    {/* style={{ overflow: 'auto', height: "100%" }} */}
                                        {/* -------- TAB: TYPE NAME ------------------*/}
                                        <Flex direction="column" alignItems="start" gap={8} padding={1} width="100%" style={{ width: "100%", flex: '1' }}>
                                            <Box padding={2}>
                                                Input the name of an existing Elasticsearch index.
                                            </Box>
                                            <Box width="100%">
                                                <TextInput value={newIndexName}
                                                onChange={(e:Event) => { setNewIndexName((e.target as HTMLInputElement).value) }}
                                                label="Index name" placeholder="Enter index name" name="Index name field" />
                                            </Box>
                                        </Flex>
                                    </TabPanel>

                                    
                                    {/* -------- TAB: SELECT FROM LIST ------------------*/}
                                    <TabPanel id="chooseFromList" style={{ overflow: 'hidden', height: "100%" }}>
                                        <Box padding={2}>
                                            Select from a list of indexes returned from the Elasticsearch instance.
                                        </Box>
                                        <Flex direction="column" alignItems="start" gap={4} padding={2} style={{ overflow: 'auto',  height: "100%"}}>
                                            { ESIndexes && ESIndexes.map((data, index) => {
                                                return (
                                                    <TextButton key={index} onClick={() => setNewIndexName(data)}>
                                                        { data }
                                                    </TextButton>
                                                )
                                            }) }
                                        </Flex>
                                    </TabPanel>                              

                                </TabPanels>
                            </TabGroup>
                        </Box>
                    </ModalBody>
                    <ModalFooter
                        startActions={<> </>}
                        endActions={
                            <Flex width="100%" justifyContent="end" gap={4}>
                                <>{newIndexName}</>
                                <Button disabled={!newIndexName} onClick={registerExistingIndexActual} variant="primary">
                                    Register index
                                </Button>
                            </Flex>
                        }
                    />
                </ModalLayout>
            )}


            { modalDeleteIndexShow && (
                <ModalLayout onClose={() => setModalDeleteIndexShow(false)}>
                    {/* labelledBy="title" */}
                    <ModalHeader>
                        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                            Delete registered index
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        <Flex direction="column" alignItems="start" gap={8}>
                            <Typography as="h2" variant="beta">Delete registered index</Typography>
                            <Flex gap={4}>
                                    <>Also delete index in Elasticsearch instance?</>
                                    <Switch
                                        onClick={ () => setDeleteFromElasticsearch(!deleteFromElasticsearch) }
                                        selected={ deleteFromElasticsearch ? true : null }
                                        visibleLabels
                                        onLabel = 'Yes'
                                        offLabel = 'No'
                                    />
                                </Flex>
                            <Flex width="100%" justifyContent="space-between">
                                <Button onClick={requestDeleteIndex} variant="primary">
                                    Delete the registration
                                </Button>
                            </Flex>

                        </Flex>
                    </ModalBody>
                    {/* <ModalFooter
                        startActions={<></>}
                        endActions={<></>}
                    /> */}
                </ModalLayout>
            )}

        </Flex>

    )
}