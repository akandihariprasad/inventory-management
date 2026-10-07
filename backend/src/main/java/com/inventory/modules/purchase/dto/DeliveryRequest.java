package com.inventory.modules.purchase.dto;

import lombok.Data;
import java.util.Map;

@Data
public class DeliveryRequest {
    private Map<Long, Integer> receivedQuantities; // productId -> received quantity
    private String notes;
}