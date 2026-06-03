package com.simback.perfume.service.implementation;

import com.simback.perfume.model.OrderStatus;
import com.simback.perfume.payload.responses.DashboardStatsResponse;
import com.simback.perfume.repository.ArticleRepository;
import com.simback.perfume.repository.OrderRepository;
import com.simback.perfume.repository.ProductRepository;
import com.simback.perfume.repository.UserRepository;
import com.simback.perfume.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ArticleRepository articleRepository;
    private final OrderRepository orderRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalArticles = articleRepository.count();

        Map<String, Long> orderStatusCounts = new HashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            orderStatusCounts.put(status.name(), orderRepository.countByStatus(status));
        }

        BigDecimal totalRevenue = orderRepository.sumGrandTotalByStatus(OrderStatus.COMPLETED);
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalArticles(totalArticles)
                .orderStatusCounts(orderStatusCounts)
                .totalRevenue(totalRevenue)
                .build();
    }
}
