import { useEffect, useState } from "react";

import {
    Box,
    Typography,
    Paper,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    CircularProgress,
    Alert,
    Divider,
    Chip
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import EventIcon from "@mui/icons-material/Event";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

import { useNavigate, useParams } from "react-router-dom";

import { apiFetch } from "../../api/api";


export default function GalleryAlbums() {

    const navigate = useNavigate();

    const { categoryId } =
        useParams();


    const [category, setCategory] =
        useState(null);

    const [albums, setAlbums] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =====================================================
    // DIALOG
    // =====================================================

    const [openDialog, setOpenDialog] =
        useState(false);

    const [editingAlbum, setEditingAlbum] =
        useState(null);

    const [saving, setSaving] =
        useState(false);

    const [draggingId, setDraggingId] =
        useState(null);

    const [dragOverId, setDragOverId] =
        useState(null);


    // =====================================================
    // FORM
    // =====================================================

    const [titleEn, setTitleEn] =
        useState("");

    const [titleMl, setTitleMl] =
        useState("");

    const [descriptionEn, setDescriptionEn] =
        useState("");

    const [descriptionMl, setDescriptionMl] =
        useState("");

    const [eventDate, setEventDate] =
        useState("");

    const [active, setActive] =
        useState(true);


    // =====================================================
    // LOAD CATEGORY + ALBUMS
    // =====================================================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                categoryResponse,
                albumsResponse
            ] = await Promise.all([

                apiFetch(
                    "/api/admin/gallery/categories"
                ),

                apiFetch(
                    `/api/admin/gallery/categories/${categoryId}/albums`
                )

            ]);


            const categoryData =
                await categoryResponse.json();

            const albumData =
                await albumsResponse.json();


            if (!categoryResponse.ok) {

                throw new Error(
                    categoryData.error ||
                    "Failed to load gallery categories"
                );

            }


            if (!albumsResponse.ok) {

                throw new Error(
                    albumData.error ||
                    "Failed to load gallery albums"
                );

            }


            const selectedCategory =
                Array.isArray(categoryData)
                    ? categoryData.find(
                        (item) =>
                            String(item.id) ===
                            String(categoryId)
                    )
                    : null;


            if (!selectedCategory) {

                throw new Error(
                    "Gallery category not found"
                );

            }


            setCategory(
                selectedCategory
            );


            const sortedAlbums =
                Array.isArray(albumData)
                    ? [...albumData].sort(
                        (a, b) =>
                            Number(a.display_order || 0) -
                            Number(b.display_order || 0) ||
                            Number(a.id) -
                            Number(b.id)
                    )
                    : [];

            setAlbums(sortedAlbums);

        }
        catch (err) {

            console.error(
                "Gallery albums loading error:",
                err
            );

            setError(
                err.message ||
                "Failed to load gallery albums"
            );

        }
        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadData();

    }, [categoryId]);


    // =====================================================
    // OPEN ADD
    // =====================================================

    const openAddDialog = () => {

        setEditingAlbum(null);

        setTitleEn("");
        setTitleMl("");
        setDescriptionEn("");
        setDescriptionMl("");
        setEventDate("");
        setActive(true);

        setError("");

        setOpenDialog(true);

    };


    // =====================================================
    // OPEN EDIT
    // =====================================================

    const openEditDialog = (album) => {

        setEditingAlbum(album);

        setTitleEn(
            album.title_en || ""
        );

        setTitleMl(
            album.title_ml || ""
        );

        setDescriptionEn(
            album.description_en || ""
        );

        setDescriptionMl(
            album.description_ml || ""
        );

        setEventDate(
            album.event_date
                ? String(album.event_date).slice(0, 10)
                : ""
        );

        setActive(
            album.active !== false
        );

        setError("");

        setOpenDialog(true);

    };


    // =====================================================
    // CLOSE DIALOG
    // =====================================================

    const closeDialog = () => {

        if (saving) {
            return;
        }

        setOpenDialog(false);

    };


    // =====================================================
    // SAVE ALBUM
    // =====================================================

    const saveAlbum = async () => {

        try {

            setSaving(true);
            setError("");

            if (!titleEn.trim()) {

                throw new Error(
                    "English album title is required"
                );

            }


            const payload = {

                category_id:
                    Number(categoryId),

                title_en:
                    titleEn.trim(),

                title_ml:
                    titleMl.trim() || null,

                description_en:
                    descriptionEn.trim() || null,

                description_ml:
                    descriptionMl.trim() || null,

                event_date:
                    eventDate || null,

                display_order:
                    editingAlbum
                        ? Number(
                            editingAlbum.display_order || 0
                        )
                        : albums.length,

                active

            };


            const response =
                await apiFetch(

                    editingAlbum
                        ? `/api/admin/gallery/albums/${editingAlbum.id}`
                        : "/api/admin/gallery/albums",

                    {
                        method:
                            editingAlbum
                                ? "PUT"
                                : "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                payload
                            )
                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to save gallery album"
                );

            }


            setOpenDialog(false);

            await loadData();

        }
        catch (err) {

            console.error(
                "Gallery album save error:",
                err
            );

            setError(
                err.message ||
                "Failed to save gallery album"
            );

        }
        finally {

            setSaving(false);

        }

    };


    // =====================================================
    // DRAG & DROP ALBUM ORDER
    // =====================================================

    const handleDragStart = (
        event,
        albumId
    ) => {

        setDraggingId(albumId);

        event.dataTransfer.effectAllowed =
            "move";

        event.dataTransfer.setData(
            "text/plain",
            String(albumId)
        );

    };


    const handleDragOver = (
        event,
        albumId
    ) => {

        event.preventDefault();

        event.dataTransfer.dropEffect =
            "move";

        if (
            draggingId !== null &&
            draggingId !== albumId
        ) {

            setDragOverId(albumId);

        }

    };


    const handleDragLeave = (
        event
    ) => {

        if (
            event.currentTarget.contains(
                event.relatedTarget
            )
        ) {

            return;

        }

        setDragOverId(null);

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
            sourceId === targetId
        ) {

            return;

        }

        const sourceIndex =
            albums.findIndex(
                (album) =>
                    Number(album.id) === sourceId
            );

        const targetIndex =
            albums.findIndex(
                (album) =>
                    Number(album.id) === targetId
            );

        if (
            sourceIndex < 0 ||
            targetIndex < 0
        ) {

            return;

        }

        const reordered =
            [...albums];

        const [
            movedAlbum
        ] =
            reordered.splice(
                sourceIndex,
                1
            );

        reordered.splice(
            targetIndex,
            0,
            movedAlbum
        );

        const updatedAlbums =
            reordered.map(
                (album, index) => ({
                    ...album,
                    display_order:
                        index + 1
                })
            );

        setAlbums(
            updatedAlbums
        );

        try {

            setError("");

            for (
                const album
                of updatedAlbums
            ) {

                const response =
                    await apiFetch(
                        `/api/admin/gallery/albums/${album.id}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    category_id:
                                        Number(
                                            album.category_id
                                        ),

                                    title_en:
                                        album.title_en,

                                    title_ml:
                                        album.title_ml ||
                                        null,

                                    description_en:
                                        album.description_en ||
                                        null,

                                    description_ml:
                                        album.description_ml ||
                                        null,

                                    event_date:
                                        album.event_date ||
                                        null,

                                    cover_image_url:
                                        album.cover_image_url ||
                                        null,

                                    display_order:
                                        indexOfAlbum(
                                            updatedAlbums,
                                            album.id
                                        ),

                                    active:
                                        album.active !== false
                                })
                        }
                    );

                if (!response.ok) {

                    const data =
                        await response.json()
                            .catch(
                                () => ({})
                            );

                    throw new Error(
                        data.error ||
                        "Failed to save album order"
                    );

                }

            }

        }
        catch (err) {

            console.error(
                "Gallery album ordering error:",
                err
            );

            setError(
                err.message ||
                "Failed to save album order"
            );

            await loadData();

        }

    };


    const indexOfAlbum = (
        albumList,
        albumId
    ) => {

        return (
            albumList.findIndex(
                (album) =>
                    Number(album.id) ===
                    Number(albumId)
            ) + 1
        );

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
                    onClick={() =>
                        navigate("/gallery")
                    }
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


                <Box>

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: "#17202a"
                        }}
                    >
                        {category
                            ? category.name_en
                            : "Gallery Albums"}
                    </Typography>


                    {category?.name_ml && (

                        <Typography
                            sx={{
                                color: "#990000",
                                fontWeight: 500,
                                mt: 0.25
                            }}
                        >
                            {category.name_ml}
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
                Manage albums in this gallery category.
            </Typography>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <Alert
                    severity="error"
                    sx={{
                        mb: 3
                    }}
                    onClose={() =>
                        setError("")
                    }
                >
                    {error}
                </Alert>

            )}


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    border:
                        "1px solid #dedede",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        "space-between",
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
                        Albums
                    </Typography>


                    <Typography
                        variant="body2"
                        sx={{
                            color: "text.secondary"
                        }}
                    >
                        {albums.length}{" "}
                        {albums.length === 1
                            ? "album"
                            : "albums"}
                    </Typography>

                    {albums.length > 1 && (

                        <Typography
                            variant="caption"
                            sx={{
                                color: "#990000",
                                display: "block",
                                mt: 0.5
                            }}
                        >
                            Drag and drop albums to arrange their display order.
                        </Typography>

                    )}

                </Box>


                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openAddDialog}
                    sx={{
                        backgroundColor: "#990000",
                        "&:hover": {
                            backgroundColor: "#7d0000"
                        }
                    }}
                >
                    Create Album
                </Button>

            </Paper>


            {/* =================================================
                LOADING
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

            ) : albums.length === 0 ? (

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
                            fontSize: 52,
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
                        No albums yet
                    </Typography>


                    <Typography
                        sx={{
                            color: "text.secondary",
                            mb: 3
                        }}
                    >
                        Create the first album for this category.
                    </Typography>


                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={openAddDialog}
                        sx={{
                            backgroundColor: "#990000",
                            "&:hover": {
                                backgroundColor: "#7d0000"
                            }
                        }}
                    >
                        Create Album
                    </Button>

                </Paper>

            ) : (

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "repeat(2, minmax(0, 1fr))"
                        },
                        gap: 2
                    }}
                >

                    {albums.map(
                        (album) => (

                            <Paper
                                key={album.id}
                                draggable
                                onDragStart={(event) =>
                                    handleDragStart(
                                        event,
                                        album.id
                                    )
                                }
                                onDragOver={(event) =>
                                    handleDragOver(
                                        event,
                                        album.id
                                    )
                                }
                                onDragLeave={handleDragLeave}
                                onDrop={(event) =>
                                    handleDrop(
                                        event,
                                        album.id
                                    )
                                }
                                onDragEnd={() => {
                                    setDraggingId(null);
                                    setDragOverId(null);
                                }}
                                elevation={0}
                                sx={{
                                    minWidth: 0,
                                    height: 255,
                                    border:
                                        dragOverId === album.id
                                            ? "2px dashed #990000"
                                            : "1px solid #dedede",
                                    opacity:
                                        draggingId === album.id
                                            ? 0.55
                                            : 1,
                                    borderRadius: 2,
                                    borderRadius: 2,
                                    backgroundColor:
                                        "#ffffff",
                                    display: "flex",
                                    flexDirection: "column",
                                    overflow: "hidden",
                                    transition:
                                        "all 0.22s ease",

                                    "&:hover": {
                                        transform:
                                            "translateY(-4px)",
                                        borderColor:
                                            "#990000",
                                        boxShadow:
                                            "0 8px 22px rgba(0,0,0,0.12)"
                                    }
                                }}
                            >

                                {/* CARD BODY */}

                                <Box
                                    sx={{
                                        p: 2.5,
                                        display: "flex",
                                        gap: 2,
                                        flex: 1
                                    }}
                                >

                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                            color: "#990000"
                                        }}
                                    >

                                        <DragIndicatorIcon
                                            sx={{
                                                cursor: "grab",
                                                color: "#999"
                                            }}
                                        />

                                        <Box
                                            sx={{
                                                width: 62,
                                                height: 62,
                                                minWidth: 62,
                                                borderRadius: 2,
                                                backgroundColor:
                                                    "#fff0f0",
                                                color: "#990000",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent:
                                                    "center"
                                            }}
                                        >

                                            <PhotoLibraryIcon />

                                        </Box>

                                    </Box>


                                    <Box
                                        sx={{
                                            flex: 1,
                                            minWidth: 0
                                        }}
                                    >

                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 700,
                                                color: "#17202a",
                                                mb: 0.5
                                            }}
                                        >
                                            {album.title_en}
                                        </Typography>


                                        {album.title_ml && (

                                            <Typography
                                                sx={{
                                                    color: "#990000",
                                                    fontWeight: 500,
                                                    mb: 1
                                                }}
                                            >
                                                {album.title_ml}
                                            </Typography>

                                        )}


                                        {album.description_en && (

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color:
                                                        "text.secondary",
                                                    lineHeight: 1.6
                                                }}
                                            >
                                                {album.description_en}
                                            </Typography>

                                        )}


                                        {album.event_date && (

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: 0.75,
                                                    mt: 1.5,
                                                    color:
                                                        "text.secondary"
                                                }}
                                            >

                                                <EventIcon
                                                    sx={{
                                                        fontSize: 18
                                                    }}
                                                />

                                                <Typography
                                                    variant="body2"
                                                >
                                                    {String(
                                                        album.event_date
                                                    ).slice(0, 10)}
                                                </Typography>

                                            </Box>

                                        )}

                                    </Box>

                                </Box>


                                {/* FOOTER */}

                                <Box
                                    sx={{
                                        borderTop:
                                            "1px solid #eeeeee",
                                        mx: 2.5,
                                        py: 1.25,
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "space-between"
                                    }}
                                >

                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems:
                                                "center",
                                            gap: 1
                                        }}
                                    >

                                        <Chip
                                            size="small"
                                            label={
                                                album.active
                                                    ? "Active"
                                                    : "Inactive"
                                            }
                                            color={
                                                album.active
                                                    ? "success"
                                                    : "default"
                                            }
                                        />

                                        <Button
                                            size="small"
                                            startIcon={
                                                <EditIcon />
                                            }
                                            onClick={() =>
                                                openEditDialog(
                                                    album
                                                )
                                            }
                                            sx={{
                                                color: "#990000"
                                            }}
                                        >
                                            Edit
                                        </Button>

                                    </Box>


                                    <Button
                                        size="small"
                                        endIcon={
                                            <ArrowForwardIosIcon
                                                sx={{
                                                    fontSize: 16
                                                }}
                                            />
                                        }
                                        onClick={() =>
                                            navigate(
                                                `/gallery/albums/${album.id}/photos`
                                            )
                                        }
                                        sx={{
                                            color: "#990000",
                                            fontWeight: 600
                                        }}
                                    >
                                        Photos
                                    </Button>

                                </Box>

                            </Paper>

                        )
                    )}

                </Box>

            )}


            {/* =================================================
                CREATE / EDIT ALBUM DIALOG
            ================================================= */}

            <Dialog
                open={openDialog}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>

                    {editingAlbum
                        ? "Edit Gallery Album"
                        : "Create Gallery Album"}

                </DialogTitle>


                <DialogContent>

                    <Typography
                        variant="body2"
                        sx={{
                            color: "text.secondary",
                            mb: 2,
                            mt: 0.5
                        }}
                    >
                        Category:{" "}
                        {category?.name_en || "-"}
                    </Typography>


                    <Divider
                        sx={{
                            mb: 3
                        }}
                    />


                    <TextField
                        fullWidth
                        required
                        label="Album Title (English)"
                        value={titleEn}
                        onChange={(e) =>
                            setTitleEn(
                                e.target.value
                            )
                        }
                        margin="normal"
                    />


                    <TextField
                        fullWidth
                        label="Album Title (Malayalam)"
                        value={titleMl}
                        onChange={(e) =>
                            setTitleMl(
                                e.target.value
                            )
                        }
                        margin="normal"
                    />


                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label="Description (English)"
                        value={descriptionEn}
                        onChange={(e) =>
                            setDescriptionEn(
                                e.target.value
                            )
                        }
                        margin="normal"
                    />


                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label="Description (Malayalam)"
                        value={descriptionMl}
                        onChange={(e) =>
                            setDescriptionMl(
                                e.target.value
                            )
                        }
                        margin="normal"
                    />


                    <Box
                        sx={{
                            mt: 2,
                            mb: 1
                        }}
                    >

                        <Typography
                            component="label"
                            sx={{
                                display: "block",
                                fontSize: "0.875rem",
                                color: "#555",
                                mb: 0.75
                            }}
                        >
                            Event Date
                        </Typography>


                        <TextField
                            fullWidth
                            type="date"
                            value={eventDate}
                            onChange={(e) =>
                                setEventDate(
                                    e.target.value
                                )
                            }
                            inputProps={{
                                "aria-label":
                                    "Event Date"
                            }}
                        />

                    </Box>


                    <FormControlLabel
                        sx={{
                            mt: 1
                        }}
                        control={
                            <Switch
                                checked={active}
                                onChange={(e) =>
                                    setActive(
                                        e.target.checked
                                    )
                                }
                            />
                        }
                        label={
                            active
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
                        onClick={closeDialog}
                        disabled={saving}
                    >
                        Cancel
                    </Button>


                    <Button
                        variant="contained"
                        onClick={saveAlbum}
                        disabled={
                            saving ||
                            !titleEn.trim()
                        }
                        sx={{
                            backgroundColor: "#990000",
                            "&:hover": {
                                backgroundColor: "#7d0000"
                            }
                        }}
                    >

                        {saving
                            ? "Saving..."
                            : editingAlbum
                                ? "Save Changes"
                                : "Create Album"}

                    </Button>

                </DialogActions>

            </Dialog>

        </Box>

    );

}
