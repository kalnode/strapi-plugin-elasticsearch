import React, { useState, useEffect } from 'react'
import pluginId from '../../pluginId'

import { Box, Flex, Button, ModalLayout, ModalHeader, ModalFooter, ModalBody, Switch, Table, Thead, Tbody, Tr, Td, Th, TFooter, Typography, EmptyStateLayout, Checkbox, TextInput, IconButton, CaretDown } from '@strapi/design-system'
import { Pencil, Trash, Refresh, Plus, Cross } from '@strapi/icons'
import '../../styles/styles.css'

import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import axiosInstance  from '../../utils/axiosInstance'
import { apiGetIndexes, apiCreateIndex, apiDeleteIndex } from '../../utils/apiUrls'
import { useHistory } from "react-router-dom"

// NOTE: The "Indexes" component exists simply for file consistency, even though it will only ever have one instance (the main Indexes page).

export const ComponentIndexes = () => {

    const [isInProgress, setIsInProgress] = useState(false)
    const [indexes, setIndexes] = useState(null)
    const [modalCreateIndexShow, setModalCreateIndexShow] = useState(false)
    const [newIndexName, setNewIndexName] = useState('')
    const [addToElasticsearch, setAddToElasticsearch] = useState(false)
    const [useNamePrepend, setUseNamePrepend] = useState(false)
    const namePrepend = "strapi_es_plugin_"
    const [modalRegisterExistingIndexShow, setModalRegisterExistingIndexShow] = useState(false)

    const [modalDeleteIndexShow, setModalDeleteIndexShow] = useState(false)
    const [indexIDToBeDeleted, setIndexIDToBeDeleted] = useState(null)
    const [deleteFromElasticsearch, setDeleteFromElasticsearch] = useState(false)

    const history = useHistory()
    const showNotification = useNotification()

    useEffect(() => {
        requestGetRegisteredIndexes()
    }, [])

    const requestGetRegisteredIndexes = () => {
        setIsInProgress(true)
        axiosInstance.get(apiGetIndexes)
        .then((response) => {
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                setIndexes(response.data)
            } else {
                setIndexes(null)
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

    const requestCreateIndex = (indexName, addToExternalIndex) => {
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

    const modalRegExistingIndexOpen = () => {
        setNewIndexName('')
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



    const modalDeleteOpen = (e, recordIndexNumber) => {
        e.stopPropagation()
        setIndexIDToBeDeleted(recordIndexNumber)
        setDeleteFromElasticsearch(false)
        setModalDeleteIndexShow(true)
    }

    const requestDeleteIndex = async () => {
        setModalDeleteIndexShow(false)
        setIsInProgress(true)
        await axiosInstance.post(apiDeleteIndex, {
            data: {
                indexId: indexIDToBeDeleted,
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
                    <Table colCount={6} rowCount={indexes.length} width="100%">
                    {/* footer={<TFooter icon={<Plus />}>Add another field to this collection type</TFooter>} */}
                        <Thead>
                            <Tr>
                                <Th>
                                    <Checkbox aria-label="Select all entries" className="checkbox" />
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
                                    <Tr key={index} className="row" onClick={() => history.push(`/plugins/${pluginId}/indexes/${data.id}`)}>
                                        <Td>
                                            <Checkbox aria-label={`Select ${data.index_name}`} className="checkbox" />
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
                                                <IconButton onClick={(e) => modalDeleteOpen(e, data.id)} label="Delete" borderWidth={0} icon={<Trash />} />                                                
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
                            Create & register index
                        </Typography>
                    </ModalHeader>
                    <ModalBody>
                        <Flex direction="column" alignItems="start" gap={8}>
                            <Flex direction="column" alignItems="start" gap={4}>
                                <Typography as="h2" variant="beta">Index name</Typography>
                                <>
                                    Create a name that's concise and descriptive.
                                </>
                                <Flex gap={4} alignItems="end">
                                    {/* {useNamePrepend && (<>strapi_es_plugin_</>) } */}
                                    <TextInput value={newIndexName} onChange={(event) => setNewIndexName(event.target.value) } label="Index name" placeholder="Enter index name" name="Index name field" />
                                </Flex>
                                <Flex gap={4}>
                                    <Checkbox aria-label="Add prepend text" className="checkbox" checked={useNamePrepend} onChange={ () => setUseNamePrepend(!useNamePrepend)} />
                                    <Box onClick={ () => setUseNamePrepend(!useNamePrepend)} cursor="pointer">Prepend with "{namePrepend}"</Box>
                                </Flex>
                            </Flex>

                            <Flex direction="column" alignItems="start" gap={4}>
                                <Typography as="h2" variant="beta">Add to Elasticsearch instance</Typography>
                                {/* <p>
                                    By default we'll attempt to create this index in the Elasticsearch instance.
                                    Turn this off if you'd rather not. You can still create the registered index, however for complete functionality.
                                </p> */}
                                <Flex gap={4}>
                                    <>Add to ES index?</>
                                    <Switch
                                        onClick={ () => setAddToElasticsearch(!addToElasticsearch) }
                                        selected={ addToElasticsearch ? true : null }
                                        visibleLabels
                                        onLabel = 'Yes'
                                        offLabel = 'No'
                                    />
                                </Flex>

                                <Typography as="h2" variant="delta">You can manage this later.</Typography>
                            </Flex>

                            <Flex width="100%" justifyContent="end" gap={4}>
                                <Flex>
                                    {useNamePrepend && (<>{namePrepend}</>) }
                                    {newIndexName}
                                </Flex>

                                <Button onClick={createIndexActual} variant="primary">
                                    {addToElasticsearch && (<>Create index & add to Elasticsearch</>) }
                                    {!addToElasticsearch && (<>Create index</>) }
                                </Button>
                            </Flex>
                        </Flex>
                    </ModalBody>
                    {/* <ModalFooter
                        startActions={
                            <>

                            </>
                        }
                        endActions={
                            <>

                            </>
                        }
                    /> */}
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
                        <Flex direction="column" alignItems="start" gap={8}>
                            <Typography as="h2" variant="beta">Existing Elasticsearch index</Typography>
                            <>
                                Register an existing Elasticsearch index with this plugin.
                            </>                            
                            <TextInput value={newIndexName} onChange={(event) => { setNewIndexName(event.target.value) }} label="Index name" placeholder="Enter index name" name="Index name field" />

                            <Flex width="100%" justifyContent="end">
                                <Button onClick={registerExistingIndexActual} variant="primary">
                                    Register index
                                </Button>
                            </Flex>

                        </Flex>
                    </ModalBody>
                    {/* <ModalFooter
                        startActions={
                            <>

                            </>
                        }
                        endActions={
                            <>

                            </>
                        }
                    /> */}
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
                        startActions={
                            <>

                            </>
                        }
                        endActions={
                            <>

                            </>
                        }
                    /> */}
                </ModalLayout>
            )}

        </Flex>

    )
}