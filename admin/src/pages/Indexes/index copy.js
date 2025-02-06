import React, { useState, useEffect } from 'react'
import pluginId from '../../pluginId'

import  { SubNavigation } from '../../components/SubNavigation'
import { Box, Flex, Button, ModalLayout, ModalHeader, ModalFooter, ModalBody, Table, Thead, Tbody, Tr, Td, Th, TFooter, Typography, EmptyStateLayout, Checkbox, TextInput, IconButton, CaretDown } from '@strapi/design-system'
import { Pencil, Trash, Refresh, Plus } from '@strapi/icons'
import '../../styles/styles.css'

import { LoadingIndicatorPage, useNotification } from '@strapi/helper-plugin'
import axiosInstance  from '../../utils/axiosInstance'
import { apiGetIndexes, apiCreateIndex, apiDeleteIndex } from '../../utils/apiUrls'
import { useHistory } from "react-router-dom"

const PageIndexes = () => {

    const [isInProgress, setIsInProgress] = useState(false)
    const [indexes, setIndexes] = useState(null)
    const [modalCreateIndexShow, setModalCreateIndexShow] = useState(false)
    const [newIndexName, setNewIndexName] = useState('')
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

    const requestCreateIndex = (indexName) => {
        setIsInProgress(true)       
        return axiosInstance.get(apiCreateIndex(indexName))
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
        setModalCreateIndexShow(true)
    }

    const modalCreateClose = () => {
        setModalCreateIndexShow(false)
    }

    const createIndexActual = () => {
        setModalCreateIndexShow(false)
        requestCreateIndex(newIndexName)
    }

    const requestDeleteIndex = (e, recordIndexNumber) => {
        e.stopPropogation()
        setIsInProgress(true)
        return axiosInstance.get(apiDeleteIndex(recordIndexNumber))
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
        <Flex alignItems="stretch" gap={4}>
            <SubNavigation />

            <Flex width="100%" direction="column" alignItems="start" gap={2} padding={8} background="neutral100">
                <Box>
                    <Typography variant="alpha">Registered Indexes</Typography>
                </Box>

                <Box>
                    <Flex gap={4}>
                        <IconButton onClick={requestGetRegisteredIndexes} label="Reload indexes" icon={<Refresh />} />
                        <Button loading={isInProgress} fullWidth variant="secondary" onClick={modalCreateOpen} startIcon={<Plus />}>Create Index</Button>
                    </Flex>
                </Box>

                <Box width="100%">
                    { (!indexes || (indexes && indexes.length === 0)) && (
                        <EmptyStateLayout icon={<Cross />} content="You don't have any content yet..." action={
                            <Button variant="secondary" startIcon={<Plus />}>
                                Create your first content-type
                            </Button>
                        } />
                    )}

                    { indexes && Array.isArray(indexes) && indexes.length > 0 && (
                        <>
                        <Table colCount={3} rowCount={indexes.length} width="100%">
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
                                    <Th width={50}>
                                        <Typography variant="sigma">Raw Mapping</Typography>
                                    </Th>
                                    <Th>
                                        <Typography variant="sigma">Active</Typography>
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                { indexes.map((data, index) => {
                                    return (
                                        <Tr key={index} className="row" onClick={() => history.push(`/plugins/${pluginId}/index/${data.id}`)}>
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
                                                <Typography textColor="neutral600">?</Typography>
                                            </Td>
                                            <Td>
                                                <Typography textColor="neutral600">{data.index_mapping}</Typography>
                                            </Td>
                                            <Td>
                                                <Typography textColor="neutral600">?</Typography>
                                            </Td>
                                            <Td>
                                                <Flex alignItems="end" gap={2}>
                                                    <IconButton label="Edit" borderWidth={0} icon={<Pencil />} />                                                  
                                                    <IconButton onClick={(e) => requestDeleteIndex(e, data.id)} label="Delete" borderWidth={0} icon={<Trash />} />                                                
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
                    <ModalLayout onClose={modalCreateClose}>
                        {/* labelledBy="title" */}
                        <ModalHeader>
                            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
                                Create index
                            </Typography>
                        </ModalHeader>
                        <ModalBody>
                            A new index will be created in Elasticsearch with the below name, and will also be registered in this plugin.
                            We prepend a standard identifier "strapi_es_plugin".
                            <TextInput value={newIndexName} onChange={(event) => { setNewIndexName(event.target.value) }} label="Index name" placeholder="Enter index name" name="Index name field" />
                            {/* onChange={e => updateMappedFieldName(e.target.value)} value={config.searchFieldName || ""} */}
                            <Button onClick={createIndexActual} variant="tertiary">
                                Create Index
                            </Button>

                            {/* {showFileDragAndDrop && (
                                <>
                                <Typography textColor="neutral800" fontWeight="bold" as="h2">
                                    {i18n('plugin.import.data-source-step.title')}
                                </Typography>
                                <Flex gap={4}>
                                    <label
                                    className={`plugin-ie-import_modal_label ${labelClassNames}`}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    >
                                    <span className="plugin-ie-import_modal_label-icon-wrapper">
                                        <IconFile />
                                    </span>
                                    <Typography style={{ fontSize: '1rem', fontWeight: 500 }} textColor="neutral600" as="p">
                                        {i18n('plugin.import.drag-drop-file')}
                                    </Typography>
                                    <input type="file" accept=".csv,.json" hidden="" onChange={onReadFile} />
                                    </label>
                                    <label className="plugin-ie-import_modal_label plugin-ie-import_modal_button-label" onClick={openCodeEditor}>
                                    <span className="plugin-ie-import_modal_label-icon-wrapper">
                                        <IconCode />
                                    </span>
                                    <Typography style={{ fontSize: '1rem', fontWeight: 500 }} textColor="neutral600" as="p">
                                        {i18n('plugin.import.use-code-editor')}
                                    </Typography>
                                    </label>
                                </Flex>
                                </>
                            )}
                            {showLoader && (
                                <>
                                <Flex justifyContent="center">
                                    <Loader>{i18n('plugin.import.importing-data')}</Loader>
                                </Flex>
                                </>
                            )}
                            {showEditor && <ImportEditor file={file} data={data} dataFormat={dataFormat} slug={slug} onDataChanged={onDataChanged} onOptionsChanged={onOptionsChanged} />}
                            {showSuccess && (
                                <>
                                <EmptyStateLayout
                                    icon={<Icon width="6rem" height="6rem" color="success500" as={CheckCircle} />}
                                    content={i18n('plugin.message.import.success.imported-successfully')}
                                    action={
                                    <Button onClick={modalCreateClose} variant="tertiary">
                                        {i18n('plugin.cta.close')}
                                    </Button>
                                    }
                                />
                                </>
                            )}
                            {showPartialSuccess && (
                                <>
                                <Typography textColor="neutral800" fontWeight="bold" as="h2">
                                    {i18n('plugin.import.partially-failed')}
                                </Typography>
                                <Typography textColor="neutral800" as="p">
                                    {i18n('plugin.import.detailed-information')}
                                </Typography>
                                <Editor content={importFailuresContent} language={'json'} readOnly />
                                </>
                            )} */}
                        </ModalBody>
                        {/* <ModalFooter
                            startActions={
                                <>
                                {showRemoveFileButton && (
                                    <Button onClick={resetDataSource} variant="tertiary">
                                    {i18n('plugin.cta.back-to-data-sources')}
                                    </Button>
                                )}
                                </>
                            }
                            endActions={
                                <>
                                {showImportButton && <Button onClick={uploadData}>{i18n('plugin.cta.import')}</Button>}
                                {showPartialSuccess && (
                                    <Button variant="secondary" onClick={copyToClipboard}>
                                    {i18n('plugin.cta.copy-to-clipboard')}
                                    </Button>
                                )}
                                </>
                            }
                        /> */}
                    </ModalLayout>
                )}

            </Flex>
        </Flex>
    )
}

export default PageIndexes
