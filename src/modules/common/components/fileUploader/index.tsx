// ** React Imports
import { Fragment, useEffect, useMemo, useState } from 'react'

// ** Reactstrap Imports
import {
    Button,
    Card,
    CardBody,
    Col,
    ListGroup,
    ListGroupItem,
    Progress,
    Row
} from 'reactstrap'

// ** Third Party Imports
import Unknown from '@@assets/images/icons/doc.png'
import Hide from '@src/utility/Hide'
import Show from '@src/utility/Show'
import { fastLoop, getFIleBinaries, isValid, isValidArray } from '@src/utility/Utils'
import { uploadFiles } from '@src/utility/http/Apis/common'
import { DropZoneOptions } from '@src/utility/types/typeForms'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, X } from 'react-feather'
import toast from 'react-hot-toast'
import LoadingButton from '../buttons/LoadingButton'

const baseStyle = {
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    //   backgroundColor: '#fafafa',
    //   color: '#bdbdbd',
    padding: 20,
    outline: 'none',
    transition: 'border .24s ease-in-out'
}

const focusedStyle = {
    borderColor: '#eeeeee'
}

const acceptStyle = {
    borderColor: '#00e676'
}

const rejectStyle = {
    borderColor: '#ff1744'
}
const DropZone = (props: {
    onChange: (e: any[]) => void
    defaultValue?: any
    dropZoneOptions?: DropZoneOptions
}) => {
    const maxFiles = 5
    // ** State
    const [files, setFiles] = useState<any[]>([])
    // controller
    const [controller, setController] = useState(new AbortController())
    // progress
    const [progress, setProgress] = useState(0)
    // loading
    const [loading, setLoading] = useState<boolean>(false)
    // uploaded
    const [uploaded, setUploaded] = useState<any[]>([])
    // saved files
    const [saved, setSaved] = useState<any[]>([])

    const {
        isFocused,
        isDragAccept,
        isDragReject,
        getRootProps,
        getInputProps,
        open,
        acceptedFiles
    } = useDropzone({
        noClick: true,
        multiple: true,
        maxFiles,
        maxSize: 10000000,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.xlsx', '.csv', '.xlx']
        },



        onDrop: (acceptedFiles, rejectedFiles) => {
            if (rejectedFiles.length) {
                toast.error('File type not accepted')
            } else {
                if (files.length <= maxFiles) {
                    if (acceptedFiles?.length > maxFiles - files.length) {
                        toast.error('File limit reached')
                    }
                    const f: any[] = []
                    acceptedFiles.forEach((file, index) => {
                        if (index < maxFiles - files.length) {
                            if (!isFileUploaded(file)) {
                                f.push(Object.assign(file))
                            } else {
                                toast.error('File already uploaded')
                            }
                        }
                    })
                    setFiles([...files, ...f])
                } else {
                    toast.error('File limit reached')
                }
            }
        }
    })

    // check if file is already uploaded
    const isFileUploaded = (file) => {
        let re = false
        fastLoop(props?.dropZoneOptions?.excludeFiles, (i) => {
            if (i.uploading_file_name === file.name) {
                re = true
            }
        })
        return re
    }

    const handleRemoveFile = (file) => {
        const uploadedFiles = files
        let filtered = uploadedFiles.filter((i) => i.name !== file.name)
        const filtered2 = uploaded.filter((i) => i.uploading_file_name !== file.name)
        setFiles([...filtered])
        setUploaded([...filtered2])
    }

    const handleRemoveFile2 = (file) => {
        const uploadedFiles = saved
        const filtered = uploadedFiles.filter((i) => i.uploading_file_name !== file.uploading_file_name)
        const filtered2 = uploaded.filter((i) => i.uploading_file_name !== file.uploading_file_name)
        setUploaded([...filtered2])
        setSaved([...filtered])
    }

    useEffect(() => {
        if (isValidArray(props.defaultValue)) {
            setSaved([...props.defaultValue])
        }
    }, [props.defaultValue])

    const renderFileSize = (size) => {
        if (Math.round(size / 100) / 10 > 1000) {
            return `${(Math.round(size / 100) / 10000).toFixed(1)} mb`
        } else {
            return `${(Math.round(size / 100) / 10).toFixed(1)} kb`
        }
    }

    useEffect(() => {
        // if (isValidArray(uploaded)) {
        props.onChange(uploaded)
        // }
    }, [uploaded])

    const uploadButtonVisible = () => {
        const re: any[] = []
        fastLoop(files, (file, index) => {
            if (!isValid(file?.uploading_file_name)) {
                re.push(file)
            }
        })
        return re.length > 0
    }

    const fileList = files.concat(saved).map((file, index) => {
        if (isValid(file?.uploading_file_name)) {
            return (
                <ListGroupItem
                    key={`${file.uploading_file_name}-${index}`}
                    className='d-flex align-items-center justify-content-between bg-light'
                >
                    <div className='file-details d-flex align-items-center'>
                        <div className='file-preview me-1'>
                            <img
                                className='rounded'
                                alt={file.uploading_file_name}
                                src={String(file?.file_extension)?.includes('image') ? file?.file_name : Unknown}
                                height='28'
                                width='28'
                            />
                        </div>
                        <div>
                            <p className='file-name mb-0'>{file.uploading_file_name}</p>
                            {/* <p className='file-size mb-0'>{renderFileSize(file.size)}</p> */}
                        </div>
                    </div>
                    <Hide IF={loading}>
                        <Button
                            color='danger'
                            outline
                            size='sm'
                            className='btn-icon'
                            onClick={() => handleRemoveFile2(file)}
                        >
                            <X size={14} />
                        </Button>
                    </Hide>
                </ListGroupItem>
            )
        } else {
            return (
                <ListGroupItem
                    key={`${file.name}-${index}`}
                    className='d-flex align-items-center justify-content-between'
                >
                    <div className='file-details d-flex align-items-center'>
                        <div className='file-preview me-1'>
                            <img
                                className='rounded'
                                alt={file.name}
                                src={String(file?.type)?.includes('image') ? URL.createObjectURL(file) : Unknown}
                                height='28'
                                width='28'
                            />
                        </div>
                        <div>
                            <p className='file-name mb-0'>{file.name}</p>
                            <p className='file-size mb-0'>{renderFileSize(file.size)}</p>
                        </div>
                    </div>
                    <Hide IF={loading}>
                        <Button
                            color='danger'
                            outline
                            size='sm'
                            className='btn-icon'
                            onClick={() => handleRemoveFile(file)}
                        >
                            <X size={14} />
                        </Button>
                    </Hide>
                </ListGroupItem>
            )
        }
    })

    const handleRemoveAllFiles = () => {
        setFiles([])
        setUploaded([])
        setSaved([])
    }

    const handleUpload = () => {
        uploadFiles({
            success: (d) => {

                setFiles([])
                setProgress(0)
                setUploaded([...saved, ...d?.payload])
            },
            loading: (e) => setLoading(e),
            progress: (e) => setProgress(e),
            controller,
            formData: {
                is_multiple: 1,
                ...getFIleBinaries(files?.filter((file) => !isValid(file?.uploading_file_name)))
            }
        })
    }
    const handleCancel = () => {
        controller?.abort()
        setController(new AbortController())
        setProgress(0)
    }

    const style: any = useMemo(
        () => ({
            ...baseStyle,
            ...(isFocused ? focusedStyle : {}),
            ...(isDragAccept ? acceptStyle : {}),
            ...(isDragReject ? rejectStyle : {})
        }),
        [isFocused, isDragAccept, isDragReject]
    )

    return (
        <Fragment>
            {files.length || saved?.length ? (
                <div className='mb-2'>
                    <div {...getRootProps({ style })}>
                        <ListGroup className='my-2'>{fileList}</ListGroup>

                        <div className='d-flex justify-content-start'>
                            <Hide IF={loading}>
                                <Hide IF={uploaded?.length > 0}>
                                    <input {...getInputProps()} />
                                    <Show IF={isValidArray(acceptedFiles) || uploadButtonVisible()}>
                                        <LoadingButton
                                            loading={loading}
                                            className='me-1'
                                            onClick={handleUpload}
                                            color='success'
                                        >
                                            Upload
                                        </LoadingButton>
                                    </Show>
                                    <Button onClick={open} className='me-1' color='primary'>
                                        Browse
                                    </Button>
                                </Hide>
                                <Button className='' color='danger' outline onClick={handleRemoveAllFiles}>
                                    Remove All
                                </Button>
                            </Hide>
                        </div>
                        <Show IF={loading}>
                            <Row className='align-items-center'>
                                <Col md='3'>
                                    <Button onClick={handleCancel} className='me-' color='danger' outline>
                                        Stop
                                    </Button>
                                </Col>
                                <Col md='9'>
                                    <Show IF={progress > 0}>
                                        <Progress animated striped className='progress-bar-primary' value={progress} />
                                    </Show>
                                </Col>
                            </Row>
                        </Show>
                    </div>
                </div>
            ) : (
                <Card>
                    <CardBody>
                        <div {...getRootProps({ style, className: 'dropzone' })}>
                            <input {...getInputProps()} />
                            <div className='mt-2 mb-2 d-flex align-items-center justify-content-center flex-column'>
                                <UploadCloud className='text-primary' size={64} />
                                <p className='mb-50 text-muted small'>Drag you files or</p>
                                <Button onClick={open} color='primary'>
                                    Browse
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </Fragment>
    )
}

export default DropZone
