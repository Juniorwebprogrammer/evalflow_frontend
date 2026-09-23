"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CompanyInfo } from "@/features/company/domain/company";
import {
  fetchCompanyByIdentificationId,
  updateCompany,
  deleteCompany,
} from "@/features/company/presentation/api/company-client";

export const companyQueryKey = (identificationId: string) =>
  ["company", identificationId] as const;

/** Reads company details by identificationId (lazy — runs when enabled). */
export function useCompany(identificationId: string) {
  return useQuery({
    queryKey: companyQueryKey(identificationId),
    queryFn: () => fetchCompanyByIdentificationId(identificationId),
    enabled: Boolean(identificationId),
  });
}

interface UpdateInput {
  nombre: string;
  logoUrl: string;
  colors: string;
  cif: string;
  sector: string;
  direccionFiscal: string;
}

/**
 * Updates the company with an optimistic cache write, rollback on error, and
 * revalidation against the backend when settled.
 */
export function useUpdateCompany(identificationId: string) {
  const queryClient = useQueryClient();
  const key = companyQueryKey(identificationId);

  return useMutation({
    mutationFn: (input: UpdateInput) => updateCompany(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CompanyInfo>(key);
      if (previous) {
        queryClient.setQueryData<CompanyInfo>(key, {
          ...previous,
          nombre: input.nombre,
          logoUrl: input.logoUrl || null,
          colors: input.colors || null,
          cif: input.cif,
          sector: input.sector,
          direccionFiscal: input.direccionFiscal,
        });
      }
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}

/** Mutation to permanently delete the caller's company. */
export function useDeleteCompany() {
  return useMutation({
    mutationFn: (input: { password: string }) => deleteCompany(input),
  });
}
