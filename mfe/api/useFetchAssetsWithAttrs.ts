import { QueryFunctionContext, useQuery } from 'react-query';
import { PromiseType } from 'utility-types';
import { fetchAssetsV3 } from '@clearblade/ia-mfe-core';
import { CbDictionary } from '@clearblade/ia-mfe-core';
import { AssetType } from '@clearblade/ia-mfe-core';
import { useAssetTypesCache } from '@clearblade/ia-mfe-core';

export const assetsWithAttrsFetcherFn = ({
  queryKey: [
    {
      params: { assetTypeDict },
    },
  ],
}: QueryFunctionContext<ReturnType<typeof assetsWithAttrsQueryKeys.all>>) =>
  fetchAssetsV3(new AbortController(), {
    columns: ['id', 'asset_type.id', 'label'],
  }).then((data) => {
    const assetsWithAttrs: { id: string; label: string; attributes: { id: string; label: string }[] }[] = data.DATA.map(
      (asset) => {
        const type = assetTypeDict[asset.asset_type?.id ?? ''];
        const attributes =
          type?.schema.map((attr) => ({
            id: attr.attribute_name,
            label: attr.attribute_label || attr.attribute_name,
          })) ?? [];
        return {
          id: asset.id || '',
          label: asset.label || asset.id || '',
          attributes,
        };
      },
    );
    return {
      COUNT: data.COUNT,
      DATA: assetsWithAttrs,
    };
  });

export type AssetQueryFnData = PromiseType<ReturnType<typeof assetsWithAttrsFetcherFn>>;

export const assetsWithAttrsQueryKeys = {
  all: (params: { assetTypeDict: CbDictionary<string, AssetType['frontend']> }) => [
    { scope: 'assetsWithAttrs', params },
  ],
};

export function useFetchAssetsWithAttrs() {
  const { data: assetTypeDictData } = useAssetTypesCache();
  const assetTypeDict = assetTypeDictData?.DATA ?? {};

  const fetchResult = useQuery(assetsWithAttrsQueryKeys.all({ assetTypeDict }), assetsWithAttrsFetcherFn, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  return fetchResult;
}