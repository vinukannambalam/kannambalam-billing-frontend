import { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    IconButton,
    Paper,
    Switch,
    TextField,
    Typography
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../api/api";

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const MAX_PHOTOS_PER_UPLOAD = 20;

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

export default function GalleryPhotos() {

    const navigate = useNavigate();

    const { albumId } = useParams();

    const fileInputRef = useRef(null);

    const [album, setAlbum] = useState(null);
    const [photos, setPhotos] = useState([]);

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [selectedFiles, setSelectedFiles] = useState([]);

    const [editingPhoto, setEditingPhoto] = useState(null);
    const [captionEn, setCaptionEn] = useState("");
    const [captionMl, setCaptionMl] = useState("");
    const [photoActive, setPhotoActive] = useState(true);

    const [deletePhoto, setDeletePhoto] = useState(null);
    const [draggingId, setDraggingId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);

    // =====================================================
    // LOAD ALBUM + PHOTOS
    // =====================================================

    const loadPhotos = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await apiFetch(
                `/api/admin/gallery/albums/${albumId}/photos`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to load gallery photos"
                );
            }

            const sorted = Array.isArray(data)
                ? [...data].sort(
                    (a, b) =>
                        Number(a.display_order || 0) -
                        Number(b.display_order || 0) ||
                        Number(a.id) -
                        Number(b.id)
                )
                : [];

            setPhotos(sorted);

        }
        catch (err) {

            console.error(
                "Gallery photos loading error:",
                err
            );

            setError(
                err.message ||
                "Failed to load gallery photos"
            );

        }
        finally {

            setLoading(false);

        }
    };

    const loadAlbum = async () => {

        try {

            const categoryResponse = await apiFetch(
                "/api/admin/gallery/categories"
            );

            if (!categoryResponse.ok) {
                return;
            }

            const categories =
                await categoryResponse.json();

            for (
                const category of
                Array.isArray(categories)
                    ? categories
                    : []
            ) {

                const albumResponse =
                    await apiFetch(
                        `/api/admin/gallery/categories/${category.id}/albums`
                    );

                if (!albumResponse.ok) {
                    continue;
                }

                const albums =
                    await albumResponse.json();

                const found =
                    Array.isArray(albums)
                        ? albums.find(
                            item =>
                                String(item.id) ===
                                String(albumId)
                        )
                        : null;

                if (found) {

                    setAlbum({
                        ...found,
                        category_name_en:
                            category.name_en,
                        category_name_ml:
                            category.name_ml
                    });

                    return;
                }
            }

        }
        catch (err) {

            console.error(
                "Gallery album lookup error:",
                err
            );

        }
    };

    useEffect(() => {

        if (!albumId) {
            return;
        }

        loadPhotos();
        loadAlbum();

    }, [albumId]);

    // =====================================================
    // SELECT FILES
    // =====================================================

    const validateSelectedFiles = (files) => {

        const incoming = Array.from(files);

        if (incoming.length === 0) {
            return [];
        }

        const combined =
            [
                ...selectedFiles,
                ...incoming
            ];

        const unique = [];

        const seen = new Set();

        for (const file of combined) {

            const key =
                `${file.name}|${file.size}|${file.lastModified}`;

            if (!seen.has(key)) {

                seen.add(key);
                unique.push(file);

            }
        }

        const valid = [];

        const errors = [];

        for (const file of unique) {

            if (!ALLOWED_TYPES.includes(file.type)) {

                errors.push(
                    `${file.name}: only JPG, JPEG, PNG and WebP images are allowed`
                );

                continue;
            }

            if (file.size > MAX_PHOTO_SIZE) {

                errors.push(
                    `${file.name}: file size must be 2 MB or smaller`
                );

                continue;
            }

            valid.push(file);

        }

        if (valid.length > MAX_PHOTOS_PER_UPLOAD) {

            errors.push(
                `You can upload a maximum of ${MAX_PHOTOS_PER_UPLOAD} photos at a time`
            );

            return valid.slice(
                0,
                MAX_PHOTOS_PER_UPLOAD
            );
        }

        if (errors.length > 0) {

            setError(
                errors.join("\n")
            );

        }
        else {

            setError("");

        }

        return valid;
    };

    const handleFileChange = (event) => {

        const valid =
            validateSelectedFiles(
                event.target.files
            );

        setSelectedFiles(valid);

        event.target.value = "";
    };

    const removeSelectedFile = (index) => {

        setSelectedFiles(
            current =>
                current.filter(
                    (_, fileIndex) =>
                        fileIndex !== index
                )
        );

    };

    const clearSelectedFiles = () => {

        setSelectedFiles([]);

        setError("");

    };

    // =====================================================
    // UPLOAD
    // =====================================================

    const uploadPhotos = async () => {

        if (selectedFiles.length === 0) {

            setError(
                "Please select at least one photo"
            );

            return;
        }

        try {

            setUploading(true);
            setError("");
            setMessage("");

            const formData = new FormData();

            selectedFiles.forEach(
                file => {
                    formData.append(
                        "photos",
                        file
                    );
                }
            );

            const response = await apiFetch(
                `/api/admin/gallery/albums/${albumId}/photos`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Photo upload failed"
                );
            }

            const count =
                Array.isArray(data.photos)
                    ? data.photos.length
                    : selectedFiles.length;

            setSelectedFiles([]);

            await loadPhotos();

            setMessage(
                `${count} photo${count === 1 ? "" : "s"} uploaded successfully`
            );

        }
        catch (err) {

            console.error(
                "Gallery photo upload error:",
                err
            );

            setError(
                err.message ||
                "Photo upload failed"
            );

        }
        finally {

            setUploading(false);

        }
    };

    // =====================================================
    // EDIT PHOTO
    // =====================================================

    const openEditPhoto = (photo) => {

        setEditingPhoto(photo);

        setCaptionEn(
            photo.caption_en || ""
        );

        setCaptionMl(
            photo.caption_ml || ""
        );

        setPhotoActive(
            photo.active !== false
        );

        setError("");

    };

    const closeEditPhoto = () => {

        if (saving) {
            return;
        }

        setEditingPhoto(null);

    };

    const savePhoto = async () => {

        if (!editingPhoto) {
            return;
        }

        try {

            setSaving(true);
            setError("");

            const response = await apiFetch(
                `/api/admin/gallery/photos/${editingPhoto.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        caption_en:
                            captionEn.trim() ||
                            null,
                        caption_ml:
                            captionMl.trim() ||
                            null,
                        active:
                            photoActive
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to update photo"
                );
            }

            setEditingPhoto(null);

            await loadPhotos();

            setMessage(
                "Photo updated successfully"
            );

        }
        catch (err) {

            console.error(
                "Gallery photo update error:",
                err
            );

            setError(
                err.message ||
                "Failed to update photo"
            );

        }
        finally {

            setSaving(false);

        }
    };

    // =====================================================
    // SET COVER
    // =====================================================

    const setCover = async (photo) => {

        try {

            setSaving(true);
            setError("");
            setMessage("");

            const response = await apiFetch(
                `/api/admin/gallery/albums/${albumId}/cover/${photo.id}`,
                {
                    method: "PUT"
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to set album cover"
                );
            }

            setAlbum(
                current =>
                    current
                        ? {
                            ...current,
                            cover_image_url:
                                photo.image_url
                        }
                        : current
            );

            setMessage(
                "Album cover updated"
            );

        }
        catch (err) {

            console.error(
                "Gallery cover update error:",
                err
            );

            setError(
                err.message ||
                "Failed to set album cover"
            );

        }
        finally {

            setSaving(false);

        }
    };

    // =====================================================
    // DELETE PHOTO
    // =====================================================

    const confirmDelete = async () => {

        if (!deletePhoto) {
            return;
        }

        try {

            setSaving(true);
            setError("");
            setMessage("");

            const response = await apiFetch(
                `/api/admin/gallery/photos/${deletePhoto.id}`,
                {
                    method: "DELETE"
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to delete photo"
                );
            }

            setDeletePhoto(null);

            await loadPhotos();

            setMessage(
                "Photo deleted successfully"
            );

        }
        catch (err) {

            console.error(
                "Gallery photo delete error:",
                err
            );

            setError(
                err.message ||
                "Failed to delete photo"
            );

        }
        finally {

            setSaving(false);

        }
    };

    // =====================================================
    // DRAG & DROP ORDER
    // =====================================================

    const handleDragStart = (
        event,
        photoId
    ) => {

        setDraggingId(photoId);

        event.dataTransfer.effectAllowed =
            "move";

        event.dataTransfer.setData(
            "text/plain",
            String(photoId)
        );

    };

    const handleDragOver = (
        event,
        photoId
    ) => {

        event.preventDefault();

        event.dataTransfer.dropEffect =
            "move";

        if (
            draggingId !== null &&
            Number(draggingId) !== Number(photoId)
        ) {

            setDragOverId(photoId);

        }

    };

    const handleDrop = async (
        event,
        targetId
    ) => {

        event.preventDefault();

        const sourceId =
            Number(
                event.dataTransfer.getData(
                    "text/plain"
                )
            );

        setDraggingId(null);
        setDragOverId(null);

        if (
            !sourceId ||
            sourceId === Number(targetId)
        ) {

            return;
        }

        const sourceIndex =
            photos.findIndex(
                photo =>
                    Number(photo.id) ===
                    sourceId
            );

        const targetIndex =
            photos.findIndex(
                photo =>
                    Number(photo.id) ===
                    Number(targetId)
            );

        if (
            sourceIndex < 0 ||
            targetIndex < 0
        ) {

            return;
        }

        const reordered =
            [...photos];

        const [moved] =
            reordered.splice(
                sourceIndex,
                1
            );

        reordered.splice(
            targetIndex,
            0,
            moved
        );

        const updated =
            reordered.map(
                (photo, index) => ({
                    ...photo,
                    display_order:
                        index + 1
                })
            );

        setPhotos(updated);

        try {

            setSaving(true);
            setError("");

            const response =
                await apiFetch(
                    `/api/admin/gallery/albums/${albumId}/photos/reorder`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            photo_ids:
                                updated.map(
                                    photo =>
                                        photo.id
                                )
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to save photo order"
                );
            }

        }
        catch (err) {

            console.error(
                "Gallery photo ordering error:",
                err
            );

            setError(
                err.message ||
                "Failed to save photo order"
            );

            await loadPhotos();

        }
        finally {

            setSaving(false);

        }
    };

    const selectedTotalSize =
        useMemo(
            () =>
                selectedFiles.reduce(
                    (sum, file) =>
                        sum + file.size,
                    0
                ),
            [selectedFiles]
        );

    const formatBytes = (bytes) => {

        if (bytes < 1024 * 1024) {
            return `${Math.round(bytes / 1024)} KB`;
        }

        return `${(
            bytes /
            (1024 * 1024)
        ).toFixed(2)} MB`;

    };

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <Box>

            {/* =================================================
                HEADER
            ================================================= */}

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 0.5
                }}
            >

                <IconButton
                    onClick={() => navigate(-1)}
                    sx={{
                        color: "#990000"
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>

                <PhotoLibraryIcon
                    sx={{
                        fontSize: 34,
                        color: "#990000"
                    }}
                />

                <Box
                    sx={{
                        minWidth: 0
                    }}
                >

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#17202a"
                        }}
                    >
                        {album?.title_en ||
                            "Gallery Photos"}
                    </Typography>

                    {album?.title_ml && (
                        <Typography
                            sx={{
                                color: "#990000",
                                fontWeight: 500,
                                mt: 0.25
                            }}
                        >
                            {album.title_ml}
                        </Typography>
                    )}

                </Box>

            </Box>


            <Typography
                sx={{
                    color: "text.secondary",
                    ml: 7,
                    mb: 3
                }}
            >
                Manage and upload photographs in this album.
            </Typography>


            {/* =================================================
                MESSAGES
            ================================================= */}

            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2,
                        whiteSpace: "pre-line"
                    }}
                    onClose={() =>
                        setError("")
                    }
                >
                    {error}
                </Alert>
            )}

            {message && (
                <Alert
                    severity="success"
                    sx={{
                        mb: 2
                    }}
                    onClose={() =>
                        setMessage("")
                    }
                >
                    {message}
                </Alert>
            )}


            {/* =================================================
                UPLOAD PANEL
            ================================================= */}

            <Paper
                elevation={0}
                sx={{
                    border:
                        "1px solid #dedede",
                    borderRadius: 2,
                    p: 2,
                    mb: 3
                }}
            >

                <Box
                    sx={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap"
                    }}
                >

                    <Box>

                        <Typography
                            sx={{
                                fontWeight: 700,
                                color: "#17202a"
                            }}
                        >
                            Upload Photos
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                mt: 0.5
                            }}
                        >
                            JPG, JPEG, PNG and WebP only. Maximum
                            2 MB per photo, up to 20 photos at a time.
                        </Typography>

                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap"
                        }}
                    >

                        <Button
                            variant="outlined"
                            startIcon={
                                <AddPhotoAlternateIcon />
                            }
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            disabled={uploading}
                            sx={{
                                color: "#990000",
                                borderColor: "#990000",
                                "&:hover": {
                                    borderColor: "#7d0000",
                                    backgroundColor: "#fff5f5"
                                }
                            }}
                        >
                            Select Photos
                        </Button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            hidden
                            multiple
                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                        />

                        <Button
                            variant="contained"
                            onClick={uploadPhotos}
                            disabled={
                                uploading ||
                                selectedFiles.length === 0
                            }
                            sx={{
                                backgroundColor: "#990000",
                                "&:hover": {
                                    backgroundColor: "#7d0000"
                                }
                            }}
                        >
                            {uploading
                                ? "Uploading..."
                                : `Upload ${selectedFiles.length || ""} ${
                                    selectedFiles.length === 1
                                        ? "Photo"
                                        : "Photos"
                                }`}
                        </Button>

                    </Box>

                </Box>


                {selectedFiles.length > 0 && (
                    <>

                        <Divider
                            sx={{
                                my: 2
                            }}
                        />

                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                mb: 1
                            }}
                        >
                            Selected:
                            {" "}
                            {selectedFiles.length}
                            {" "}
                            photo
                            {selectedFiles.length === 1
                                ? ""
                                : "s"}
                            {" "}
                            ({formatBytes(
                                selectedTotalSize
                            )} total)
                        </Typography>


                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1
                            }}
                        >

                            {selectedFiles.map(
                                (file, index) => (
                                    <Chip
                                        key={`${file.name}-${file.lastModified}`}
                                        label={`${file.name} (${formatBytes(file.size)})`}
                                        onDelete={() =>
                                            removeSelectedFile(
                                                index
                                            )
                                        }
                                        disabled={uploading}
                                    />
                                )
                            )}

                        </Box>


                        <Button
                            size="small"
                            onClick={
                                clearSelectedFiles
                            }
                            disabled={uploading}
                            sx={{
                                mt: 1,
                                color: "#990000"
                            }}
                        >
                            Clear selection
                        </Button>

                    </>
                )}

            </Paper>


            {/* =================================================
                PHOTO GRID
            ================================================= */}

            {loading ? (

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        py: 8
                    }}
                >
                    <CircularProgress />
                </Box>

            ) : photos.length === 0 ? (

                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        textAlign: "center",
                        border:
                            "1px solid #dedede",
                        borderRadius: 2
                    }}
                >

                    <PhotoLibraryIcon
                        sx={{
                            fontSize: 56,
                            color: "#c9c9c9",
                            mb: 1
                        }}
                    />

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            mb: 1
                        }}
                    >
                        No photos yet
                    </Typography>

                    <Typography
                        sx={{
                            color: "text.secondary"
                        }}
                    >
                        Select photos above to add them to this album.
                    </Typography>

                </Paper>

            ) : (

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, minmax(0, 1fr))",
                            md: "repeat(3, minmax(0, 1fr))",
                            lg: "repeat(4, minmax(0, 1fr))"
                        },
                        gap: 2
                    }}
                >

                    {photos.map(
                        (photo) => {

                            const isCover =
                                album?.cover_image_url ===
                                photo.image_url;

                            return (

                                <Paper
                                    key={photo.id}
                                    draggable
                                    onDragStart={(event) =>
                                        handleDragStart(
                                            event,
                                            photo.id
                                        )
                                    }
                                    onDragOver={(event) =>
                                        handleDragOver(
                                            event,
                                            photo.id
                                        )
                                    }
                                    onDrop={(event) =>
                                        handleDrop(
                                            event,
                                            photo.id
                                        )
                                    }
                                    onDragEnd={() => {
                                        setDraggingId(null);
                                        setDragOverId(null);
                                    }}
                                    sx={{
                                        overflow: "hidden",
                                        borderRadius: 2,
                                        border:
                                            dragOverId === photo.id
                                                ? "2px dashed #990000"
                                                : "1px solid #dedede",
                                        opacity:
                                            draggingId === photo.id
                                                ? 0.55
                                                : 1,
                                        backgroundColor:
                                            "#fff"
                                    }}
                                >

                                    <Box
                                        sx={{
                                            position: "relative",
                                            width: "100%",
                                            aspectRatio: "4 / 3",
                                            backgroundColor:
                                                "#f3f3f3"
                                        }}
                                    >

                                        <Box
                                            component="img"
                                            src={photo.image_url}
                                            alt={
                                                photo.caption_en ||
                                                photo.file_name ||
                                                "Gallery photo"
                                            }
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                display: "block"
                                            }}
                                        />

                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: 8,
                                                left: 8,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                backgroundColor:
                                                    "rgba(255,255,255,0.92)",
                                                borderRadius: 1,
                                                px: 0.5
                                            }}
                                        >

                                            <DragIndicatorIcon
                                                sx={{
                                                    fontSize: 18,
                                                    color: "#777",
                                                    cursor: "grab"
                                                }}
                                            />

                                            {isCover && (
                                                <Chip
                                                    size="small"
                                                    icon={
                                                        <StarIcon />
                                                    }
                                                    label="Cover"
                                                    color="warning"
                                                />
                                            )}

                                        </Box>

                                        {photo.active === false && (
                                            <Chip
                                                size="small"
                                                label="Inactive"
                                                sx={{
                                                    position: "absolute",
                                                    top: 8,
                                                    right: 8,
                                                    backgroundColor:
                                                        "rgba(255,255,255,0.92)"
                                                }}
                                            />
                                        )}

                                    </Box>


                                    <Box
                                        sx={{
                                            p: 1.5
                                        }}
                                    >

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis"
                                            }}
                                            title={photo.file_name}
                                        >
                                            {photo.file_name}
                                        </Typography>

                                        {photo.caption_en && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    mt: 0.5,
                                                    color: "text.secondary",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient:
                                                        "vertical",
                                                    overflow: "hidden"
                                                }}
                                            >
                                                {photo.caption_en}
                                            </Typography>
                                        )}

                                        {photo.caption_ml && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    mt: 0.25,
                                                    color: "#990000",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient:
                                                        "vertical",
                                                    overflow: "hidden"
                                                }}
                                            >
                                                {photo.caption_ml}
                                            </Typography>
                                        )}


                                        <Divider
                                            sx={{
                                                my: 1
                                            }}
                                        />


                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent:
                                                    "space-between"
                                            }}
                                        >

                                            <Button
                                                size="small"
                                                startIcon={
                                                    isCover
                                                        ? <StarIcon />
                                                        : <StarBorderIcon />
                                                }
                                                onClick={() =>
                                                    setCover(photo)
                                                }
                                                disabled={
                                                    saving ||
                                                    photo.active === false ||
                                                    isCover
                                                }
                                                sx={{
                                                    color: "#990000",
                                                    minWidth: 0
                                                }}
                                            >
                                                {isCover
                                                    ? "Cover"
                                                    : "Set Cover"}
                                            </Button>


                                            <Box>

                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        openEditPhoto(
                                                            photo
                                                        )
                                                    }
                                                    disabled={saving}
                                                    sx={{
                                                        color: "#990000"
                                                    }}
                                                    title="Edit photo"
                                                >
                                                    <EditIcon
                                                        sx={{
                                                            fontSize: 19
                                                        }}
                                                    />
                                                </IconButton>

                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        setDeletePhoto(
                                                            photo
                                                        )
                                                    }
                                                    disabled={saving}
                                                    sx={{
                                                        color: "#990000"
                                                    }}
                                                    title="Delete photo"
                                                >
                                                    <DeleteIcon
                                                        sx={{
                                                            fontSize: 20
                                                        }}
                                                    />
                                                </IconButton>

                                            </Box>

                                        </Box>

                                    </Box>

                                </Paper>

                            );
                        }
                    )}

                </Box>

            )}


            {/* =================================================
                EDIT PHOTO DIALOG
            ================================================= */}

            <Dialog
                open={Boolean(editingPhoto)}
                onClose={closeEditPhoto}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>
                    Edit Photo
                </DialogTitle>

                <DialogContent>

                    <Typography
                        variant="body2"
                        sx={{
                            color: "text.secondary",
                            mb: 2
                        }}
                    >
                        {editingPhoto?.file_name || ""}
                    </Typography>

                    <Divider
                        sx={{
                            mb: 2
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Caption (English)"
                        value={captionEn}
                        onChange={(e) =>
                            setCaptionEn(
                                e.target.value
                            )
                        }
                        margin="normal"
                    />

                    <TextField
                        fullWidth
                        label="Caption (Malayalam)"
                        value={captionMl}
                        onChange={(e) =>
                            setCaptionMl(
                                e.target.value
                            )
                        }
                        margin="normal"
                    />

                    <FormControlLabel
                        sx={{
                            mt: 1
                        }}
                        control={
                            <Switch
                                checked={photoActive}
                                onChange={(e) =>
                                    setPhotoActive(
                                        e.target.checked
                                    )
                                }
                            />
                        }
                        label={
                            photoActive
                                ? "Active"
                                : "Inactive"
                        }
                    />

                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2
                    }}
                >

                    <Button
                        onClick={closeEditPhoto}
                        disabled={saving}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={savePhoto}
                        disabled={saving}
                        sx={{
                            backgroundColor: "#990000",
                            "&:hover": {
                                backgroundColor: "#7d0000"
                            }
                        }}
                    >
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </Button>

                </DialogActions>

            </Dialog>


            {/* =================================================
                DELETE CONFIRMATION
            ================================================= */}

            <Dialog
                open={Boolean(deletePhoto)}
                onClose={() => {
                    if (!saving) {
                        setDeletePhoto(null);
                    }
                }}
                maxWidth="xs"
                fullWidth
            >

                <DialogTitle>
                    Delete Photo?
                </DialogTitle>

                <DialogContent>

                    <Typography>
                        Are you sure you want to delete
                        {" "}
                        <strong>
                            {deletePhoto?.file_name || "this photo"}
                        </strong>
                        ?
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            mt: 1,
                            color: "text.secondary"
                        }}
                    >
                        The photo will be removed from the gallery
                        and its stored S3 object will also be deleted.
                    </Typography>

                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2
                    }}
                >

                    <Button
                        onClick={() =>
                            setDeletePhoto(null)
                        }
                        disabled={saving}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={confirmDelete}
                        disabled={saving}
                        sx={{
                            backgroundColor: "#990000",
                            "&:hover": {
                                backgroundColor: "#7d0000"
                            }
                        }}
                    >
                        {saving
                            ? "Deleting..."
                            : "Delete Photo"}
                    </Button>

                </DialogActions>

            </Dialog>

        </Box>
    );
}
