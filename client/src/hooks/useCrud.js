import { create, deleteById, getAll, updateById } from "../lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, message } from "antd";
import { useState } from "react";

export const useCrud = (endpoint) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(undefined);

  function useFetch(params) {
    return useQuery({
      queryKey: [endpoint, params],
      queryFn: () => getAll(endpoint, params),
      staleTime: 60 * 1000 * 10, // 10 minutes
    });
  }

  function refreshData() {
    queryClient.invalidateQueries({ queryKey: [endpoint] });
  }

  const createMutation = useMutation({
    mutationFn: (data) => create(endpoint, data),
    onSuccess: () => {
      message.success("Data created successfully");
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setModalOpen(false);
      setEditingData(undefined);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Failed to create data");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateById(endpoint, id, data),
    onSuccess: () => {
      message.success("Data updated successfully");
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setModalOpen(false);
      setEditingData(undefined);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Failed to update user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteById(endpoint, id),
    onSuccess: () => {
      message.success("Data deleted successfully");
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error) => {
      message.error(error.response?.data?.message || "Failed to delete data");
    },
  });

  const handleSubmit = async (values) => {
    if (editingData) {
      updateMutation.mutate({ id: editingData.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleAdd = () => {
    setEditingData(null);
    setModalOpen(true);
  };

  const handleEdit = (data) => {
    setEditingData(data);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingData(undefined);
  };

  return {
    form,
    createMutation,
    updateMutation,
    deleteMutation,
    modalOpen,
    editingData,
    queryClient,
    useFetch,
    setModalOpen,
    setEditingData,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleModalClose,
    refreshData,
  };
};
